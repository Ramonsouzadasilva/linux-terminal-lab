import { VirtualFile } from '../types';

export const INITIAL_FS: VirtualFile = {
  name: '/',
  type: 'dir',
  permissions: 755,
  owner: 'root',
  group: 'root',
  size: 4096,
  updatedAt: new Date().toISOString(),
  children: [
    {
      name: 'bin',
      type: 'dir',
      permissions: 755,
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: [
        { name: 'ls', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 14500, updatedAt: new Date().toISOString(), content: 'Executable binary for ls' },
        { name: 'cd', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 8200, updatedAt: new Date().toISOString(), content: 'Shell builtin for cd' },
        { name: 'cat', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 12400, updatedAt: new Date().toISOString(), content: 'Executable binary for cat' },
        { name: 'nano', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 28000, updatedAt: new Date().toISOString(), content: 'Executable binary for nano' },
        { name: 'grep', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 19500, updatedAt: new Date().toISOString(), content: 'Executable binary for grep' },
        { name: 'bash', type: 'file', permissions: 755, owner: 'root', group: 'root', size: 32000, updatedAt: new Date().toISOString(), content: 'Executable binary for bash' }
      ]
    },
    {
      name: 'etc',
      type: 'dir',
      permissions: 755,
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: [
        {
          name: 'passwd',
          type: 'file',
          permissions: 644,
          owner: 'root',
          group: 'root',
          size: 421,
          updatedAt: new Date().toISOString(),
          content: 'root:x:0:0:root:/root:/bin/bash\nhacker:x:1000:1000:Linux Hacker:/home/hacker:/bin/bash\ninvitado:x:1001:1001:Guest User:/home/guest:/bin/bash\nmisterioso:x:9999:9999:Secret Agent:/dev/null:/bin/bash\n'
        },
        {
          name: 'hostname',
          type: 'file',
          permissions: 644,
          owner: 'root',
          group: 'root',
          size: 9,
          updatedAt: new Date().toISOString(),
          content: 'linux-lab\n'
        },
        {
          name: 'issue',
          type: 'file',
          permissions: 644,
          owner: 'root',
          group: 'root',
          size: 48,
          updatedAt: new Date().toISOString(),
          content: 'Bem-vindo ao Simulador Linux Interativo v1.4.0\n'
        }
      ]
    },
    {
      name: 'home',
      type: 'dir',
      permissions: 755,
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: [
        {
          name: 'hacker',
          type: 'dir',
          permissions: 700,
          owner: 'hacker',
          group: 'hacker',
          size: 4096,
          updatedAt: new Date().toISOString(),
          children: [
            {
              name: 'README.txt',
              type: 'file',
              permissions: 644,
              owner: 'hacker',
              group: 'hacker',
              size: 512,
              updatedAt: new Date().toISOString(),
              content: '==================================================\n  BEM-VINDO AO SIMULADOR LINUX INTERATIVO\n==================================================\n\nEste é um terminal Linux completo rodando em sandbox.\nVocê pode usar comandos clássicos como:\n  - ls      : Listar arquivos\n  - cd      : Navegar entre pastas\n  - touch   : Criar arquivos\n  - mkdir   : Criar diretórios\n  - nano    : Editar arquivos\n  - cat     : Visualizar conteúdo\n\nAbra o aplicativo "Central de Aprendizado" (Academy) \npara iniciar as Missões de Linux e evoluir seu nível!\n\nSenha padrão para comando sudo: linux\n==================================================\n'
            },
            {
              name: 'documentos',
              type: 'dir',
              permissions: 755,
              owner: 'hacker',
              group: 'hacker',
              size: 4096,
              updatedAt: new Date().toISOString(),
              children: [
                {
                  name: 'manual.txt',
                  type: 'file',
                  permissions: 644,
                  owner: 'hacker',
                  group: 'hacker',
                  size: 215,
                  updatedAt: new Date().toISOString(),
                  content: 'MANUAL DO ADMINISTRADOR LINUX\n\n1. Permissões de arquivo podem ser alteradas usando chmod.\n   Exemplo: chmod 755 backup.sh\n2. Para executar um script: ./backup.sh ou bash backup.sh\n3. Use grep para filtrar logs.'
                },
                {
                  name: 'backup.sh',
                  type: 'file',
                  permissions: 644, // Initially non-executable to let Level 2 teach chmod 755!
                  owner: 'hacker',
                  group: 'hacker',
                  size: 154,
                  updatedAt: new Date().toISOString(),
                  content: '#!/bin/bash\necho "[+] Iniciando backup de arquivos..."\necho "[+] Compactando /home/hacker/documentos..."\nsleep 1\necho "[✔] Backup concluído com sucesso!"\n'
                }
              ]
            },
            {
              name: '.secret',
              type: 'dir',
              permissions: 700,
              owner: 'hacker',
              group: 'hacker',
              size: 4096,
              updatedAt: new Date().toISOString(),
              children: [
                {
                  name: 'hidden_message.txt',
                  type: 'file',
                  permissions: 600,
                  owner: 'hacker',
                  group: 'hacker',
                  size: 182,
                  updatedAt: new Date().toISOString(),
                  content: 'Easter Egg Encontrado! 🕵️\n\nVocê descobriu um diretório oculto e um arquivo confidencial!\nUse o código de conquista: "SECRET_AGENT_2026" para validar sua curiosidade nerd.\nMuito bem!'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      name: 'var',
      type: 'dir',
      permissions: 755,
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: [
        {
          name: 'log',
          type: 'dir',
          permissions: 755,
          owner: 'root',
          group: 'root',
          size: 4096,
          updatedAt: new Date().toISOString(),
          children: [
            {
              name: 'syslog',
              type: 'file',
              permissions: 640,
              owner: 'root',
              group: 'root',
              size: 450,
              updatedAt: new Date().toISOString(),
              content: 'Jul 18 12:00:01 linux-lab kernel: [    0.000000] Booting Linux kernel v6.2.3...\nJul 18 12:00:02 linux-lab systemd[1]: Started Virtual System Disk Check.\nJul 18 12:01:10 linux-lab sshd[425]: Accepted publickey for hacker from 192.168.1.50 port 54311 ssh2\nJul 18 12:15:32 linux-lab sudo[1208]: hacker : TTY=pts/0 ; PWD=/home/hacker ; USER=root ; COMMAND=/bin/cat /etc/passwd\n'
            },
            {
              name: 'nginx.log',
              type: 'file',
              permissions: 644,
              owner: 'root',
              group: 'root',
              size: 920,
              updatedAt: new Date().toISOString(),
              content: '192.168.1.105 - - [18/Jul/2026:12:05:01] "GET /index.html HTTP/1.1" 200 4520\n192.168.1.105 - - [18/Jul/2026:12:05:15] "GET /assets/logo.png HTTP/1.1" 200 12510\n192.168.1.200 - - [18/Jul/2026:12:10:04] "POST /login.php HTTP/1.1" 401 254\n10.0.3.55 - - [18/Jul/2026:12:12:30] "GET /admin/setup.php?db=test UNION SELECT NULL,username,password FROM users HTTP/1.1" 500 812\n192.168.1.105 - - [18/Jul/2026:12:14:40] "GET /api/status HTTP/1.1" 200 82\n10.0.3.55 - - [18/Jul/2026:12:15:10] "GET /admin/shell.php?cmd=whoami HTTP/1.1" 404 154\n'
            }
          ]
        }
      ]
    },
    {
      name: 'tmp',
      type: 'dir',
      permissions: 777,
      owner: 'root',
      group: 'root',
      size: 4096,
      updatedAt: new Date().toISOString(),
      children: []
    }
  ]
};

// Help resolve relative and absolute paths
export function resolveAbsolutePath(currentDir: string, targetPath: string): string {
  let resolved = targetPath.startsWith('/') ? targetPath : `${currentDir}/${targetPath}`;
  
  // Clean multiple slashes
  resolved = resolved.replace(/\/+/g, '/');
  
  // Resolve . and ..
  const parts = resolved.split('/');
  const stack: string[] = [];
  
  for (const part of parts) {
    if (part === '' || part === '.') {
      continue;
    }
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  
  return '/' + stack.join('/');
}

// Find node at absolute path
export function findNodeByPath(root: VirtualFile, path: string): VirtualFile | null {
  if (path === '/' || path === '') return root;
  
  const parts = path.split('/').filter(p => p !== '');
  let currentNode: VirtualFile = root;
  
  for (const part of parts) {
    if (currentNode.type !== 'dir' || !currentNode.children) {
      return null;
    }
    const nextNode = currentNode.children.find(child => child.name === part);
    if (!nextNode) {
      return null;
    }
    currentNode = nextNode;
  }
  
  return currentNode;
}

// Check if user has permission. Simple emulation.
// owner, permissions (e.g., 755: owner 7 (rwx), group 5 (r-x), other 5 (r-x))
export function checkPermission(node: VirtualFile, user: string, action: 'read' | 'write' | 'execute'): boolean {
  if (user === 'root') return true; // root overrides all permissions
  
  const permString = node.permissions.toString();
  const ownerPerm = parseInt(permString[0] || '0', 10);
  const groupPerm = parseInt(permString[1] || '0', 10);
  const otherPerm = parseInt(permString[2] || '0', 10);
  
  let requiredBit = 4; // Read
  if (action === 'write') requiredBit = 2;
  if (action === 'execute') requiredBit = 1;
  
  if (node.owner === user) {
    return (ownerPerm & requiredBit) !== 0;
  }
  
  // Simple check for group or others
  return (otherPerm & requiredBit) !== 0;
}

// Formats permissions into drwxr-xr-x format
export function formatPermissions(node: VirtualFile): string {
  const isDir = node.type === 'dir' ? 'd' : '-';
  const permString = node.permissions.toString().padStart(3, '0');
  
  const formatOctal = (valStr: string) => {
    const val = parseInt(valStr, 10);
    const r = (val & 4) ? 'r' : '-';
    const w = (val & 2) ? 'w' : '-';
    const x = (val & 1) ? 'x' : '-';
    return r + w + x;
  };
  
  return isDir + formatOctal(permString[0]) + formatOctal(permString[1]) + formatOctal(permString[2]);
}

// Recursively update node in deep file tree structure
export function updateNodeAtPath(root: VirtualFile, path: string, updater: (node: VirtualFile) => VirtualFile): VirtualFile {
  const resolvedPath = resolveAbsolutePath('/', path);
  if (resolvedPath === '/') {
    return updater(root);
  }
  
  const parts = resolvedPath.split('/').filter(p => p !== '');
  
  const updateRecursive = (node: VirtualFile, currentDepth: number): VirtualFile => {
    if (currentDepth === parts.length) {
      return updater(node);
    }
    
    const targetName = parts[currentDepth];
    if (node.type !== 'dir' || !node.children) return node;
    
    return {
      ...node,
      children: node.children.map(child => {
        if (child.name === targetName) {
          return updateRecursive(child, currentDepth + 1);
        }
        return child;
      })
    };
  };
  
  return updateRecursive(root, 0);
}

// Recursively add/delete file/directory at parent path
export function modifyNodeChildren(
  root: VirtualFile, 
  parentPath: string, 
  action: 'add' | 'remove', 
  payload: VirtualFile | string // VirtualFile to add, or string name to remove
): VirtualFile {
  return updateNodeAtPath(root, parentPath, (parent) => {
    if (parent.type !== 'dir') return parent;
    
    let updatedChildren = [...(parent.children || [])];
    
    if (action === 'add') {
      const fileToAdd = payload as VirtualFile;
      // Prevent duplicates, replace if exists or return
      const existingIdx = updatedChildren.findIndex(c => c.name === fileToAdd.name);
      if (existingIdx !== -1) {
        updatedChildren[existingIdx] = fileToAdd;
      } else {
        updatedChildren.push(fileToAdd);
      }
    } else {
      const nameToRemove = payload as string;
      updatedChildren = updatedChildren.filter(c => c.name !== nameToRemove);
    }
    
    return {
      ...parent,
      size: 4096 + updatedChildren.reduce((acc, file) => acc + file.size, 0),
      updatedAt: new Date().toISOString(),
      children: updatedChildren
    };
  });
}
