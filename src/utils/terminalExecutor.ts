import { VirtualFile, Mission, Achievement, UserProfile } from '../types';
import { 
  resolveAbsolutePath, 
  findNodeByPath, 
  modifyNodeChildren, 
  updateNodeAtPath, 
  formatPermissions,
  checkPermission 
} from './fsHelper';

export interface CommandResult {
  output: string;
  updatedFS: VirtualFile;
  updatedDir: string;
  xpEarned: number;
  unlockedAchievementId?: string;
  completedMissionId?: string;
  showNano?: string; // filename to open in nano
  showMatrix?: boolean;
  clearScreen?: boolean;
}

export function executeCommand(
  commandLine: string,
  currentDir: string,
  fs: VirtualFile,
  currentUser: string,
  activeMission: Mission | null,
  allMissions: Mission[],
  unlockedAchievements: string[]
): CommandResult {
  const result: CommandResult = {
    output: '',
    updatedFS: fs,
    updatedDir: currentDir,
    xpEarned: 0
  };

  const trimmed = commandLine.trim();
  if (!trimmed) return result;

  // 1. Check for Output Redirection (e.g. command > file or command >> file)
  let cmdToExec = trimmed;
  let redirectFile: string | null = null;
  let redirectMode: 'overwrite' | 'append' | null = null;

  const appendIndex = trimmed.indexOf('>>');
  const overwriteIndex = trimmed.indexOf('>');

  if (appendIndex !== -1 && (overwriteIndex === -1 || appendIndex < overwriteIndex)) {
    cmdToExec = trimmed.substring(0, appendIndex).trim();
    redirectFile = trimmed.substring(appendIndex + 2).trim();
    redirectMode = 'append';
  } else if (overwriteIndex !== -1) {
    cmdToExec = trimmed.substring(0, overwriteIndex).trim();
    redirectFile = trimmed.substring(overwriteIndex + 1).trim();
    redirectMode = 'overwrite';
  }

  // 2. Parse command arguments
  // Basic shell tokenization (handling spaces and quotes)
  const args: string[] = [];
  let currentToken = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < cmdToExec.length; i++) {
    const char = cmdToExec[i];
    if ((char === '"' || char === "'") && (i === 0 || cmdToExec[i - 1] !== '\\')) {
      if (inQuotes && char === quoteChar) {
        inQuotes = false;
      } else if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      }
    } else if (char === ' ' && !inQuotes) {
      if (currentToken) {
        args.push(currentToken);
        currentToken = '';
      }
    } else {
      currentToken += char;
    }
  }
  if (currentToken) {
    args.push(currentToken);
  }

  if (args.length === 0) {
    return result;
  }

  const baseCommand = args[0];
  const commandArgs = args.slice(1);

  // 3. Execution logic of standard commands
  let commandOutput = '';
  let tempFS = fs;
  let tempDir = currentDir;
  let runAsUser = currentUser;

  // Sudo command wrapper
  let actualCmd = baseCommand;
  let actualArgs = commandArgs;

  if (baseCommand === 'sudo') {
    runAsUser = 'root';
    if (commandArgs.length === 0) {
      result.output = 'usage: sudo <command> [arguments]';
      return result;
    }
    actualCmd = commandArgs[0];
    actualArgs = commandArgs.slice(1);
  }

  switch (actualCmd) {
    case 'help':
      commandOutput = `Comandos Linux Simulados Disponíveis:
  ls [opções] [path]  - Listar diretórios (suporta -l, -a, -la)
  cd [diretório]      - Mudar de diretório atual
  pwd                 - Exibir diretório de trabalho atual
  mkdir <nome>        - Criar diretório
  touch <nome>        - Criar arquivo vazio ou atualizar data
  rm [opções] <nome>  - Excluir arquivos ou pastas (use -r para pastas)
  cp <origem> <dest>  - Copiar arquivos ou pastas
  mv <origem> <dest>  - Mover ou renomear arquivos/pastas
  cat <arquivo>       - Exibir conteúdo do arquivo
  nano <arquivo>      - Editor de texto interativo de terminal
  echo [texto]        - Exibir texto (suporta redirecionamento > e >>)
  grep <padrão> <arq> - Filtrar linhas correspondentes em arquivos
  find <dir> [filtros]- Buscar arquivos no sistema de arquivos
  chmod <octal> <arq> - Alterar permissões de arquivos (ex: chmod 755)
  chown <dono> <arq>  - Alterar dono do arquivo
  sudo <comando>      - Executar comando como superusuário root
  neofetch            - Exibir dados do sistema Linux com arte ASCII
  cmatrix / matrix    - Chuva de códigos verdes estilo Matrix
  ps                  - Listar processos em execução no sistema
  kill <PID>          - Finalizar um processo pelo ID
  history             - Mostrar histórico de comandos executados
  clear               - Limpar o terminal

DICA: Use TAB para completar nomes de comandos, arquivos ou pastas!
`;
      break;

    case 'pwd':
      commandOutput = tempDir;
      break;

    case 'clear':
      result.clearScreen = true;
      break;

    case 'history':
      commandOutput = 'Executado recentemente: ' + commandLine;
      break;

    case 'neofetch':
      commandOutput = `               .-.
              /   \\        hacker@linux-lab
             |  _  |       ----------------
             | | | |       OS: Linux Lab v1.4.0 (Custom Build)
             | |_| |       Kernel: 6.2.3-cyber-x86_64
         ..__/_   _\\__..   Uptime: 4 hours, 21 mins
        /  __ \\' '/ __  \\  Shell: bash 5.1.16
       |  /  \\ \\_/ /  \\  | Theme: ${currentUser === 'root' ? 'Red Alert' : 'Kali Dark UI'}
       | |    |   |    | | Terminal: xterm-256color
       \\  \\__/ /_\\ \\__/  / CPU: Virtual AMD Ryzen 9 5950X (4) @ 3.4GHz
        \\.._ __/ \\__ _../  Memory: 1.84 GiB / 8.00 GiB (23%)
            '---------'    Disk: 12.4 GiB / 40.0 GiB (31%)
                           XP Acumulado: ${allMissions.filter(m => m.isCompleted).reduce((sum, m) => sum + m.xpReward, 0)} XP
`;
      break;

    case 'matrix':
    case 'cmatrix':
      result.showMatrix = true;
      break;

    case 'ls': {
      const showHidden = actualArgs.includes('-a') || actualArgs.includes('-la') || actualArgs.includes('-al');
      const longFormat = actualArgs.includes('-l') || actualArgs.includes('-la') || actualArgs.includes('-al');
      
      // Filter out flags to find the path argument if specified
      const pathArg = actualArgs.filter(arg => !arg.startsWith('-'))[0];
      const targetPath = pathArg ? resolveAbsolutePath(tempDir, pathArg) : tempDir;
      const node = findNodeByPath(tempFS, targetPath);

      if (!node) {
        commandOutput = `ls: não foi possível acessar '${pathArg}': Arquivo ou diretório não encontrado`;
      } else if (node.type === 'file') {
        if (longFormat) {
          commandOutput = `${formatPermissions(node)}  1 ${node.owner}  ${node.group}  ${node.size} ${node.updatedAt.slice(0,10)} ${node.name}`;
        } else {
          commandOutput = node.name;
        }
      } else {
        // Node is directory
        const children = node.children || [];
        const visibleChildren = showHidden ? children : children.filter(c => !c.name.startsWith('.'));
        
        if (longFormat) {
          commandOutput = `total ${visibleChildren.length}\n` + visibleChildren.map(child => {
            const formattedDate = new Date(child.updatedAt).toLocaleDateString('pt-BR', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            return `${formatPermissions(child)}  1 ${child.owner}  ${child.group}  ${child.size.toString().padStart(5, ' ')} ${formattedDate.padStart(12, ' ')} ${child.name}`;
          }).join('\n');
        } else {
          commandOutput = visibleChildren.map(child => child.name).join('    ');
        }
      }
      break;
    }

    case 'cd': {
      const dest = actualArgs[0] || '/home/hacker';
      const targetPath = resolveAbsolutePath(tempDir, dest);
      const node = findNodeByPath(tempFS, targetPath);

      if (!node) {
        commandOutput = `bash: cd: ${dest}: Arquivo ou diretório não encontrado`;
      } else if (node.type !== 'dir') {
        commandOutput = `bash: cd: ${dest}: Não é um diretório`;
      } else {
        // Check permission
        if (!checkPermission(node, runAsUser, 'read')) {
          commandOutput = `bash: cd: ${dest}: Permissão negada`;
        } else {
          tempDir = targetPath;
        }
      }
      break;
    }

    case 'mkdir': {
      const folderName = actualArgs[0];
      if (!folderName) {
        commandOutput = 'mkdir: operando faltando';
      } else {
        const resolvedParent = tempDir;
        const parentNode = findNodeByPath(tempFS, resolvedParent);

        if (!parentNode || parentNode.type !== 'dir') {
          commandOutput = `mkdir: não foi possível criar o diretório '${folderName}': Pasta pai inválida`;
        } else if (!checkPermission(parentNode, runAsUser, 'write')) {
          commandOutput = `mkdir: não foi possível criar o diretório '${folderName}': Permissão negada`;
        } else if (parentNode.children?.some(child => child.name === folderName)) {
          commandOutput = `mkdir: não foi possível criar o diretório '${folderName}': Arquivo ou pasta já existe`;
        } else {
          const newFolder: VirtualFile = {
            name: folderName,
            type: 'dir',
            permissions: 755,
            owner: runAsUser,
            group: runAsUser === 'root' ? 'root' : 'hacker',
            size: 4096,
            updatedAt: new Date().toISOString(),
            children: []
          };
          tempFS = modifyNodeChildren(tempFS, resolvedParent, 'add', newFolder);
          commandOutput = `Pasta "${folderName}" criada com sucesso.`;
        }
      }
      break;
    }

    case 'touch': {
      const fileName = actualArgs[0];
      if (!fileName) {
        commandOutput = 'touch: operando arquivo faltando';
      } else {
        const resolvedParent = tempDir;
        const parentNode = findNodeByPath(tempFS, resolvedParent);

        if (!parentNode || parentNode.type !== 'dir') {
          commandOutput = `touch: não foi possível criar '${fileName}': Pasta inválida`;
        } else if (!checkPermission(parentNode, runAsUser, 'write')) {
          commandOutput = `touch: não foi possível criar '${fileName}': Permissão negada`;
        } else {
          const existingFile = parentNode.children?.find(c => c.name === fileName);
          if (existingFile) {
            // Update timestamp
            const updated = { ...existingFile, updatedAt: new Date().toISOString() };
            tempFS = modifyNodeChildren(tempFS, resolvedParent, 'add', updated);
          } else {
            const newFile: VirtualFile = {
              name: fileName,
              type: 'file',
              permissions: 644,
              owner: runAsUser,
              group: runAsUser === 'root' ? 'root' : 'hacker',
              size: 0,
              updatedAt: new Date().toISOString(),
              content: ''
            };
            tempFS = modifyNodeChildren(tempFS, resolvedParent, 'add', newFile);
          }
        }
      }
      break;
    }

    case 'rm': {
      const recursive = actualArgs.includes('-r') || actualArgs.includes('-rf') || actualArgs.includes('-f-r') || actualArgs.includes('-rf');
      const force = actualArgs.includes('-f') || actualArgs.includes('-rf');
      const fileArg = actualArgs.filter(arg => !arg.startsWith('-'))[0];

      if (!fileArg) {
        commandOutput = 'rm: operando faltando';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, fileArg);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          if (!force) {
            commandOutput = `rm: não foi possível remover '${fileArg}': Arquivo ou diretório não encontrado`;
          }
        } else {
          const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
          const parentNode = findNodeByPath(tempFS, parentPath);

          if (node.type === 'dir' && !recursive) {
            commandOutput = `rm: não foi possível remover '${fileArg}': É um diretório (use -r ou -rf)`;
          } else if (parentNode && !checkPermission(parentNode, runAsUser, 'write')) {
            commandOutput = `rm: não foi possível remover '${fileArg}': Permissão negada`;
          } else if (targetPath === '/' || targetPath === '/home' || targetPath === '/var') {
            commandOutput = `rm: operação perigosa de remoção de '${targetPath}' cancelada pelo kernel sandbox do Simulador Linux! Nice try! 🐋`;
          } else {
            tempFS = modifyNodeChildren(tempFS, parentPath, 'remove', node.name);
            commandOutput = `"${node.name}" removido com sucesso.`;
          }
        }
      }
      break;
    }

    case 'cat': {
      const fileName = actualArgs[0];
      if (!fileName) {
        commandOutput = 'cat: operando arquivo faltando';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, fileName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `cat: ${fileName}: Arquivo ou diretório não encontrado`;
        } else if (node.type === 'dir') {
          commandOutput = `cat: ${fileName}: É um diretório`;
        } else if (!checkPermission(node, runAsUser, 'read')) {
          commandOutput = `cat: ${fileName}: Permissão negada`;
        } else {
          commandOutput = node.content || '';
        }
      }
      break;
    }

    case 'nano': {
      const fileName = actualArgs[0];
      if (!fileName) {
        commandOutput = 'nano: arquivo requerido';
      } else {
        result.showNano = resolveAbsolutePath(tempDir, fileName);
      }
      break;
    }

    case 'echo': {
      // Reconstruct text, handle options if any, and filter quotes
      const textToEcho = actualArgs.join(' ');
      commandOutput = textToEcho.replace(/^["']|["']$/g, '');
      break;
    }

    case 'grep': {
      const pattern = actualArgs[0];
      const fileName = actualArgs[1];
      
      if (!pattern) {
        commandOutput = 'uso: grep <padrão> <arquivo>';
      } else if (!fileName) {
        commandOutput = 'grep: especificador de arquivo faltando';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, fileName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `grep: ${fileName}: Arquivo não encontrado`;
        } else if (node.type === 'dir') {
          commandOutput = `grep: ${fileName}: É um diretório`;
        } else if (!checkPermission(node, runAsUser, 'read')) {
          commandOutput = `grep: ${fileName}: Permissão negada`;
        } else {
          const lines = (node.content || '').split('\n');
          const regex = new RegExp(pattern, 'i'); // case-insensitive matching
          const matches = lines.filter(line => regex.test(line));
          commandOutput = matches.join('\n');
        }
      }
      break;
    }

    case 'find': {
      const targetDirArg = actualArgs.filter(arg => !arg.startsWith('-') && arg !== 'find')[0] || '.';
      const nameIndex = actualArgs.indexOf('-name');
      const searchPattern = nameIndex !== -1 ? actualArgs[nameIndex + 1]?.replace(/['"']/g, '') : null;

      const resolvedSearchDir = resolveAbsolutePath(tempDir, targetDirArg);
      const searchNode = findNodeByPath(tempFS, resolvedSearchDir);

      if (!searchNode) {
        commandOutput = `find: '${targetDirArg}': Caminho não encontrado`;
      } else {
        const matches: string[] = [];
        
        const traverse = (node: VirtualFile, currentPath: string) => {
          const displayPath = currentPath === '/' ? `/${node.name}` : `${currentPath}/${node.name}`;
          const cleanDisplayPath = displayPath.replace(/^\/\/+/, '/');
          
          if (!searchPattern || node.name.includes(searchPattern.replace(/\*/g, ''))) {
            matches.push(cleanDisplayPath);
          }
          
          if (node.type === 'dir' && node.children) {
            node.children.forEach(child => traverse(child, cleanDisplayPath));
          }
        };

        if (searchNode.type === 'dir' && searchNode.children) {
          searchNode.children.forEach(child => traverse(child, resolvedSearchDir === '/' ? '' : resolvedSearchDir));
        } else {
          matches.push(resolvedSearchDir);
        }

        commandOutput = matches.join('\n');
      }
      break;
    }

    case 'chmod': {
      const perms = actualArgs[0];
      const fileName = actualArgs[1];

      if (!perms || !fileName) {
        commandOutput = 'uso: chmod <octal_permissions|ugo+rwx> <arquivo>';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, fileName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `chmod: não foi possível acessar '${fileName}': Arquivo ou diretório não encontrado`;
        } else if (node.owner !== runAsUser && runAsUser !== 'root') {
          commandOutput = `chmod: alterando permissões de '${fileName}': Operação não permitida`;
        } else {
          let targetPermNum = 644;
          if (/^[0-7]{3}$/.test(perms)) {
            targetPermNum = parseInt(perms, 10);
          } else if (perms === '+x') {
            // simple simulation: turn standard read/write into read/write/exec
            targetPermNum = 755;
          } else {
            targetPermNum = 755;
          }

          tempFS = updateNodeAtPath(tempFS, targetPath, (target) => ({
            ...target,
            permissions: targetPermNum,
            updatedAt: new Date().toISOString()
          }));
          commandOutput = `Permissões de "${node.name}" alteradas para ${targetPermNum}.`;
        }
      }
      break;
    }

    case 'chown': {
      const ownerGroup = actualArgs[0];
      const fileName = actualArgs[1];

      if (!ownerGroup || !fileName) {
        commandOutput = 'uso: chown <dono>[:<grupo>] <arquivo>';
      } else if (runAsUser !== 'root') {
        commandOutput = 'chown: alterando proprietário de arquivo: Operação não permitida (requer root/sudo)';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, fileName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `chown: não foi possível acessar '${fileName}': Arquivo ou diretório não encontrado`;
        } else {
          const parts = ownerGroup.split(':');
          const owner = parts[0];
          const group = parts[1] || node.group;

          tempFS = updateNodeAtPath(tempFS, targetPath, (target) => ({
            ...target,
            owner,
            group,
            updatedAt: new Date().toISOString()
          }));
          commandOutput = `Proprietário de "${node.name}" alterado para ${owner}:${group}.`;
        }
      }
      break;
    }

    case 'ps':
      commandOutput = `  PID TTY          TIME CMD
    1 pts/0    00:00:01 init
  200 pts/0    00:00:00 systemd
  450 pts/0    00:00:02 bash
  999 pts/0    00:03:14 cryptominer  <-- ALTO CPU! (Minerador de Cripto Suspeito)
 1205 pts/0    00:00:00 ps
`;
      break;

    case 'kill': {
      const pid = actualArgs[0];
      if (!pid) {
        commandOutput = 'kill: operando PID faltando';
      } else if (pid === '999') {
        commandOutput = '[+] Enviando sinal SIGKILL para o processo 999 (cryptominer)...\n[✔] Processo finalizado com sucesso! CPU do sistema normalizado. +500 XP!';
        result.completedMissionId = 'm8';
        result.xpEarned = 500;
      } else {
        commandOutput = `kill: (${pid}) - Nenhum processo correspondente encontrado ou permissão negada.`;
      }
      break;
    }

    case 'bash': {
      const scriptName = actualArgs[0];
      if (!scriptName) {
        commandOutput = 'bash: nome do script necessário';
      } else {
        const targetPath = resolveAbsolutePath(tempDir, scriptName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `bash: ${scriptName}: Arquivo não encontrado`;
        } else if (node.type === 'dir') {
          commandOutput = `bash: ${scriptName}: É um diretório`;
        } else {
          // Check permissions
          const hasExec = (parseInt(node.permissions.toString()[0] || '0', 10) & 1) !== 0;
          
          if (currentUser !== 'root' && !hasExec) {
            commandOutput = `bash: ./${node.name}: Permissão negada (script não é executável, use "chmod +x" ou "chmod 755" primeiro)`;
          } else {
            // Simulate script execution content
            const content = node.content || '';
            const lines = content.split('\n');
            const outputs: string[] = [];
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('echo ')) {
                // simple echo command simulation
                outputs.push(trimmedLine.substring(5).replace(/^['"]|['"]$/g, ''));
              } else if (trimmedLine.startsWith('sleep ')) {
                // dummy wait
              }
            }
            commandOutput = outputs.join('\n');
          }
        }
      }
      break;
    }

    default:
      // Check if trying to execute current directory script, e.g., `./backup.sh`
      if (actualCmd.startsWith('./')) {
        const scriptName = actualCmd.substring(2);
        const targetPath = resolveAbsolutePath(tempDir, scriptName);
        const node = findNodeByPath(tempFS, targetPath);

        if (!node) {
          commandOutput = `bash: ${actualCmd}: Arquivo ou diretório não encontrado`;
        } else if (node.type === 'dir') {
          commandOutput = `bash: ${actualCmd}: É um diretório`;
        } else {
          const hasExec = (parseInt(node.permissions.toString()[0] || '0', 10) & 1) !== 0;
          if (currentUser !== 'root' && !hasExec) {
            commandOutput = `bash: ${actualCmd}: Permissão negada. Use "chmod 755 ${scriptName}" para torná-lo executável!`;
          } else {
            const content = node.content || '';
            const lines = content.split('\n');
            const outputs: string[] = [];
            
            for (const line of lines) {
              const trimmedLine = line.trim();
              if (trimmedLine.startsWith('echo ')) {
                outputs.push(trimmedLine.substring(5).replace(/^['"]|['"]$/g, ''));
              }
            }
            commandOutput = outputs.join('\n');
          }
        }
      } else {
        commandOutput = `bash: ${actualCmd}: comando não encontrado. Digite "help" para ver os comandos de estudo suportados.`;
      }
  }

  // 4. Handle output redirection to files (if specified and valid command run)
  if (redirectFile && redirectMode && commandOutput && !commandOutput.startsWith('bash:')) {
    const targetPath = resolveAbsolutePath(tempDir, redirectFile);
    const parentPath = targetPath.substring(0, targetPath.lastIndexOf('/')) || '/';
    const parentNode = findNodeByPath(tempFS, parentPath);

    if (!parentNode || parentNode.type !== 'dir') {
      commandOutput = `bash: ${redirectFile}: Caminho pai inválido`;
    } else if (!checkPermission(parentNode, runAsUser, 'write')) {
      commandOutput = `bash: ${redirectFile}: Permissão negada`;
    } else {
      const existingNode = findNodeByPath(tempFS, targetPath);
      let newContent = commandOutput + '\n';
      
      if (existingNode && existingNode.type === 'file' && redirectMode === 'append') {
        newContent = (existingNode.content || '') + newContent;
      }

      const updatedFile: VirtualFile = {
        name: targetPath.substring(targetPath.lastIndexOf('/') + 1),
        type: 'file',
        permissions: existingNode?.permissions || 644,
        owner: existingNode?.owner || runAsUser,
        group: existingNode?.group || (runAsUser === 'root' ? 'root' : 'hacker'),
        size: newContent.length,
        updatedAt: new Date().toISOString(),
        content: newContent
      };

      tempFS = modifyNodeChildren(tempFS, parentPath, 'add', updatedFile);
      commandOutput = ''; // Output redirected to file, standard output is empty!
    }
  }

  // 5. Evaluate Gamification/Missions!
  result.updatedFS = tempFS;
  result.updatedDir = tempDir;
  result.output = commandOutput;

  // Evaluate the ACTIVE mission first!
  if (activeMission && !activeMission.isCompleted) {
    const isCompleted = activeMission.validationCheck(tempFS, tempDir, actualCmd, actualArgs, commandOutput);
    if (isCompleted) {
      result.completedMissionId = activeMission.id;
      result.xpEarned = activeMission.xpReward;
    }
  }

  // Check achievements triggered by command and status
  if (!unlockedAchievements.includes('ach_folder') && actualCmd === 'mkdir' && !commandOutput.includes('não foi possível')) {
    result.unlockedAchievementId = 'ach_folder';
    result.xpEarned += 50;
  } else if (!unlockedAchievements.includes('ach_write') && actualCmd === 'touch' && !commandOutput.includes('não foi possível')) {
    // Or if writing with redirect
    if (redirectFile) {
      result.unlockedAchievementId = 'ach_write';
      result.xpEarned += 50;
    }
  } else if (!unlockedAchievements.includes('ach_security') && actualCmd === 'grep' && actualArgs.some(a => a.toUpperCase().includes('UNION')) && commandOutput.includes('UNION SELECT')) {
    result.unlockedAchievementId = 'ach_security';
    result.xpEarned += 50;
  } else if (!unlockedAchievements.includes('ach_script') && actualCmd === 'chmod' && actualArgs.includes('755')) {
    result.unlockedAchievementId = 'ach_script';
    result.xpEarned += 50;
  }

  return result;
}
