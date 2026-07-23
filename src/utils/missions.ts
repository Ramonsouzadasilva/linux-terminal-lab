import { Mission, Achievement, VirtualFile } from '../types';
import { findNodeByPath } from './fsHelper';

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm1',
    level: 1,
    title: 'Criando a Pasta de Projetos',
    description: 'Navegue para o diretório `/home/hacker` e crie uma nova pasta chamada `projetos`.',
    instruction: 'Use "cd /home/hacker" para ir ao diretório pessoal e depois "mkdir projetos" para criar a pasta.',
    hint: 'Comando: cd /home/hacker && mkdir projetos. Use "ls" para verificar se a pasta foi criada!',
    xpReward: 100,
    isCompleted: false,
    validationCheck: (fs: VirtualFile) => {
      const node = findNodeByPath(fs, '/home/hacker/projetos');
      return !!node && node.type === 'dir';
    }
  },
  {
    id: 'm2',
    level: 1,
    title: 'O Primeiro Arquivo HTML',
    description: 'Crie um arquivo chamado `index.html` dentro da sua nova pasta de projetos.',
    instruction: 'Entre na pasta de projetos usando "cd projetos" (ou o caminho completo) e crie o arquivo usando "touch index.html".',
    hint: 'Use "cd /home/hacker/projetos" e depois "touch index.html".',
    xpReward: 150,
    isCompleted: false,
    validationCheck: (fs: VirtualFile) => {
      const node = findNodeByPath(fs, '/home/hacker/projetos/index.html');
      return !!node && node.type === 'file';
    }
  },
  {
    id: 'm3',
    level: 1,
    title: 'Escrevendo e Lendo Conteúdo',
    description: 'Adicione um título HTML no arquivo `index.html` e depois leia-o no terminal.',
    instruction: 'Abra o editor usando "nano index.html" para escrever um texto, salve-o (CTRL+O, Enter, CTRL+X). Ou use "echo \'<h1>Ola Linux</h1>\' > index.html". Em seguida, visualize com "cat index.html".',
    hint: 'Escreva conteúdo no arquivo index.html e execute "cat index.html" (ou "cat /home/hacker/projetos/index.html").',
    xpReward: 200,
    isCompleted: false,
    validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[]) => {
      const node = findNodeByPath(fs, '/home/hacker/projetos/index.html');
      const hasContent = !!node && node.type === 'file' && (node.content || '').trim().length > 0;
      const isCat = lastCommand === 'cat';
      const targetsFile = lastArgs.some(arg => arg.includes('index.html'));
      return hasContent && isCat && targetsFile;
    }
  },
  {
    id: 'm4',
    level: 2,
    title: 'Dominando Permissões de Scripts',
    description: 'Torne o script de backup `/home/hacker/documentos/backup.sh` executável.',
    instruction: 'Por padrão, novos scripts não possuem permissão de execução. Use o comando "chmod 755 documentos/backup.sh" para mudar isso.',
    hint: 'Digite "chmod 755 /home/hacker/documentos/backup.sh" ou use chmod +x se preferir.',
    xpReward: 250,
    isCompleted: false,
    validationCheck: (fs: VirtualFile) => {
      const node = findNodeByPath(fs, '/home/hacker/documentos/backup.sh');
      if (!node) return false;
      // Check if user/owner has execution permission (the first octal digit is odd, i.e., includes 1)
      const permStr = node.permissions.toString();
      const ownerVal = parseInt(permStr[0] || '0', 10);
      return (ownerVal & 1) !== 0; // has executable permission
    }
  },
  {
    id: 'm5',
    level: 2,
    title: 'Executando Tarefas em Background',
    description: 'Execute o script de backup `/home/hacker/documentos/backup.sh` que agora está executável.',
    instruction: 'Navegue até a pasta "/home/hacker/documentos" e execute o script usando "./backup.sh", ou simplesmente chame "bash /home/hacker/documentos/backup.sh".',
    hint: 'Use "./backup.sh" dentro de "documentos" ou "bash /home/hacker/documentos/backup.sh". Verifique a saída do script.',
    xpReward: 300,
    isCompleted: false,
    validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[], output: string) => {
      const ranScript = (lastCommand === 'bash' && lastArgs.some(a => a.includes('backup.sh'))) ||
                        (lastCommand.endsWith('backup.sh') || lastCommand === './backup.sh');
      const successMessage = output.includes('Backup concluído com sucesso');
      return ranScript && successMessage;
    }
  },
  {
    id: 'm6',
    level: 2,
    title: 'Auditoria de Logs de Invasão',
    description: 'Um atacante tentou realizar uma Injeção SQL em nossa aplicação. Filtre os logs do Nginx buscando por "UNION" para encontrar a URL de ataque.',
    instruction: 'O arquivo de log está em "/var/log/nginx.log". Use o comando "grep UNION /var/log/nginx.log" para investigá-lo.',
    hint: 'Digite o comando "grep UNION /var/log/nginx.log" no terminal.',
    xpReward: 350,
    isCompleted: false,
    validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[], output: string) => {
      const isGrep = lastCommand === 'grep';
      const hasUnion = lastArgs.some(arg => arg.toUpperCase().includes('UNION'));
      const hasLog = lastArgs.some(arg => arg.includes('nginx.log'));
      const outputMatches = output.includes('UNION SELECT');
      return isGrep && hasUnion && (hasLog || outputMatches);
    }
  },
  {
    id: 'm7',
    level: 3,
    title: 'Criando seu Primeiro Alerta Bash',
    description: 'Crie um script em `/home/hacker/alerta.sh` que emite um alerta de invasão e execute-o.',
    instruction: 'Crie o arquivo usando "touch /home/hacker/alerta.sh", depois use o nano ou faça: "echo \'echo \"[!] ALERTA DE SEGURANCA: Invasao detectada\"\' > /home/hacker/alerta.sh". Execute-o com "bash /home/hacker/alerta.sh".',
    hint: 'Crie o arquivo, escreva o código com echo e depois rode "bash /home/hacker/alerta.sh".',
    xpReward: 400,
    isCompleted: false,
    validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[], output: string) => {
      const fileNode = findNodeByPath(fs, '/home/hacker/alerta.sh');
      const hasContent = !!fileNode && fileNode.type === 'file' && (fileNode.content || '').includes('ALERTA');
      const ranScript = (lastCommand === 'bash' && lastArgs.some(a => a.includes('alerta.sh'))) ||
                        (lastCommand.endsWith('alerta.sh') || lastCommand === './alerta.sh');
      const producedOutput = output.includes('ALERTA');
      return hasContent && ranScript && producedOutput;
    }
  },
  {
    id: 'm8',
    level: 3,
    title: 'Análise de Processos Maliciosos',
    description: 'Encontre e neutralize o processo do minerador oculto (cryptominer) de PID 999 que está consumindo recursos do sistema.',
    instruction: 'Digite "ps" no terminal para listar os processos suspeitos, localize o "cryptominer" com PID 999 e finalize-o rodando "kill 999", ou use o Gerenciador de Processos visual.',
    hint: 'Use o comando "kill 999" ou clique em "Finalizar Processo" (Kill) no aplicativo Monitor de Sistema para o PID 999.',
    xpReward: 500,
    isCompleted: false,
    validationCheck: (fs: VirtualFile, currentDir: string, lastCommand: string, lastArgs: string[], output: string) => {
      // Checked dynamically by active process removal
      return false; // Handled specifically in terminal executor and system monitor
    }
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_boot',
    title: 'Primeiro Boot',
    description: 'Ligou o sistema e fez login pela primeira vez no Simulador Linux.',
    icon: 'Terminal',
    isUnlocked: false
  },
  {
    id: 'ach_folder',
    title: 'Organizador de Arquivos',
    description: 'Criou sua primeira pasta virtual usando o comando mkdir.',
    icon: 'FolderPlus',
    isUnlocked: false
  },
  {
    id: 'ach_write',
    title: 'Escritor de Códigos',
    description: 'Escreveu conteúdo em um arquivo de texto e salvou com sucesso.',
    icon: 'FileText',
    isUnlocked: false
  },
  {
    id: 'ach_security',
    title: 'Analista Blue Team',
    description: 'Filtrou logs de segurança e descobriu uma tentativa de ataque SQLi.',
    icon: 'ShieldAlert',
    isUnlocked: false
  },
  {
    id: 'ach_script',
    title: 'Automatizador Linux',
    description: 'Tornou um script executável e realizou a execução direta.',
    icon: 'Cpu',
    isUnlocked: false
  },
  {
    id: 'ach_admin',
    title: 'Mestre do Sysadmin',
    description: 'Concluiu todas as missões do roadmap e tornou-se Administrador Linux!',
    icon: 'Award',
    isUnlocked: false
  }
];
