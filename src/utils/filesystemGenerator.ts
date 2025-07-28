import { FileSystemNode } from '../types/filesystem';

const getRandomDate = (): string => {
  const start = new Date(2023, 0, 1);
  const end = new Date();
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return randomDate.toISOString().split('T')[0];
};

const getRandomSize = (min: number = 1024, max: number = 1048576): number => {
  return Math.floor(Math.random() * (max - min) + min);
};

const generateLogContent = (): string => {
  const logTypes = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
  const services = ['apache2', 'mysql', 'ssh', 'firewall', 'backup'];
  const messages = [
    'Connection established from 192.168.1.100',
    'Authentication successful for user admin',
    'Database backup completed successfully',
    'Firewall rule updated',
    'Service restart initiated',
    'Memory usage at 85%',
    'Disk space warning: /var partition 90% full',
    'SSL certificate expires in 30 days',
    'Failed login attempt detected',
    'System update available'
  ];

  const lines = [];
  for (let i = 0; i < 10; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7).toISOString();
    const level = logTypes[Math.floor(Math.random() * logTypes.length)];
    const service = services[Math.floor(Math.random() * services.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    lines.push(`${timestamp} [${level}] ${service}: ${message}`);
  }
  return lines.join('\n');
};

const generateConfigContent = (filename: string): string => {
  switch (filename) {
    case 'passwd':
      return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
admin:x:1000:1000:Admin User:/home/admin:/bin/bash
mysql:x:999:999:MySQL Server:/var/lib/mysql:/bin/false`;
    case 'shadow':
      return `root:$6$randomsalt$hashedpassword:18500:0:99999:7:::
admin:$6$anothersalt$anotherhashedpass:18500:0:99999:7:::`;
    case 'hosts':
      return `127.0.0.1	localhost
127.0.1.1	server.local
192.168.1.1	gateway
192.168.1.100	workstation`;
    case 'apache2.conf':
      return `ServerRoot /etc/apache2
Listen 80
Listen 443 ssl

LoadModule rewrite_module modules/mod_rewrite.so
LoadModule ssl_module modules/mod_ssl.so

DocumentRoot /var/www/html
DirectoryIndex index.html index.php

<Directory /var/www/html>
    AllowOverride All
    Require all granted
</Directory>`;
    case 'mysql.conf':
      return `[mysqld]
bind-address = 127.0.0.1
port = 3306
datadir = /var/lib/mysql
socket = /var/run/mysqld/mysqld.sock
log-error = /var/log/mysql/error.log
max_connections = 100`;
    default:
      return `# Configuration file for ${filename}
# Generated automatically
# Do not edit manually

[settings]
enabled=true
debug=false
timeout=30`;
  }
};

const generateSecretContent = (): string => {
  const secrets = [
    'API_KEY=sk_live_51H7x8yGqF9k2L3m4N5o6P7q8R9s0T1u2V3w4X5y6Z',
    'DATABASE_PASSWORD=SuperSecretPassword123!',
    'JWT_SECRET=myverysecretjwtkey2023',
    'ENCRYPTION_KEY=AES256_KEY_HERE_DO_NOT_SHARE',
    'ADMIN_PASSWORD=admin123_CHANGE_ME',
    'BACKUP_ENCRYPTION_KEY=backup_key_2023_secure'
  ];
  return secrets[Math.floor(Math.random() * secrets.length)];
};

export const generateFileSystem = (): Record<string, FileSystemNode> => {
  const usernames = ['admin', 'user', 'developer', 'manager'];
  const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
  
  return {
    etc: {
      name: 'etc',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: getRandomDate(),
      children: {
        passwd: {
          name: 'passwd',
          type: 'file',
          content: generateConfigContent('passwd'),
          size: getRandomSize(500, 1000),
          permissions: '-rw-r--r--',
          owner: 'root',
          modified: getRandomDate()
        },
        shadow: {
          name: 'shadow',
          type: 'file',
          content: generateConfigContent('shadow'),
          size: getRandomSize(200, 400),
          permissions: '-rw-------',
          owner: 'root',
          modified: getRandomDate()
        },
        hosts: {
          name: 'hosts',
          type: 'file',
          content: generateConfigContent('hosts'),
          size: getRandomSize(100, 300),
          permissions: '-rw-r--r--',
          owner: 'root',
          modified: getRandomDate()
        },
        apache2: {
          name: 'apache2',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          modified: getRandomDate(),
          children: {
            'apache2.conf': {
              name: 'apache2.conf',
              type: 'file',
              content: generateConfigContent('apache2.conf'),
              size: getRandomSize(1000, 2000),
              permissions: '-rw-r--r--',
              owner: 'root',
              modified: getRandomDate()
            }
          }
        },
        mysql: {
          name: 'mysql',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'mysql',
          modified: getRandomDate(),
          children: {
            'my.cnf': {
              name: 'my.cnf',
              type: 'file',
              content: generateConfigContent('mysql.conf'),
              size: getRandomSize(800, 1500),
              permissions: '-rw-r-----',
              owner: 'mysql',
              modified: getRandomDate()
            }
          }
        }
      }
    },
    home: {
      name: 'home',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: getRandomDate(),
      children: {
        [randomUser]: {
          name: randomUser,
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: randomUser,
          modified: getRandomDate(),
          children: {
            'documents': {
              name: 'documents',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              owner: randomUser,
              modified: getRandomDate(),
              children: {
                'notes.txt': {
                  name: 'notes.txt',
                  type: 'file',
                  content: 'Meeting notes from last week:\n- Discuss new security protocols\n- Update server configurations\n- Review backup procedures\n\nTODO: Change default passwords!',
                  size: getRandomSize(200, 500),
                  permissions: '-rw-r--r--',
                  owner: randomUser,
                  modified: getRandomDate()
                },
                'passwords.txt': {
                  name: 'passwords.txt',
                  type: 'file',
                  content: 'CONFIDENTIAL - Password List:\nDatabase: db_pass_2023\nFTP: ftp_secure_123\nEmail: mail_admin_456\n\nNOTE: These should be encrypted!',
                  size: getRandomSize(150, 300),
                  permissions: '-rw-------',
                  owner: randomUser,
                  modified: getRandomDate()
                }
              }
            },
            '.secrets': {
              name: '.secrets',
              type: 'file',
              content: generateSecretContent(),
              size: getRandomSize(100, 200),
              permissions: '-rw-------',
              owner: randomUser,
              modified: getRandomDate()
            }
          }
        }
      }
    },
    var: {
      name: 'var',
      type: 'directory',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: getRandomDate(),
      children: {
        log: {
          name: 'log',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          modified: getRandomDate(),
          children: {
            'system.log': {
              name: 'system.log',
              type: 'file',
              content: generateLogContent(),
              size: getRandomSize(5000, 10000),
              permissions: '-rw-r--r--',
              owner: 'root',
              modified: getRandomDate()
            },
            'auth.log': {
              name: 'auth.log',
              type: 'file',
              content: generateLogContent(),
              size: getRandomSize(3000, 8000),
              permissions: '-rw-r-----',
              owner: 'root',
              modified: getRandomDate()
            },
            'apache2': {
              name: 'apache2',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              owner: 'www-data',
              modified: getRandomDate(),
              children: {
                'access.log': {
                  name: 'access.log',
                  type: 'file',
                  content: '192.168.1.100 - - [' + new Date().toISOString() + '] "GET / HTTP/1.1" 200 1234\n192.168.1.101 - - [' + new Date().toISOString() + '] "POST /login HTTP/1.1" 302 0\n192.168.1.102 - - [' + new Date().toISOString() + '] "GET /admin HTTP/1.1" 403 567',
                  size: getRandomSize(2000, 5000),
                  permissions: '-rw-r--r--',
                  owner: 'www-data',
                  modified: getRandomDate()
                }
              }
            }
          }
        },
        www: {
          name: 'www',
          type: 'directory',
          permissions: 'drwxr-xr-x',
          owner: 'www-data',
          modified: getRandomDate(),
          children: {
            html: {
              name: 'html',
              type: 'directory',
              permissions: 'drwxr-xr-x',
              owner: 'www-data',
              modified: getRandomDate(),
              children: {
                'index.html': {
                  name: 'index.html',
                  type: 'file',
                  content: '<!DOCTYPE html>\n<html>\n<head>\n    <title>Corporate Server</title>\n</head>\n<body>\n    <h1>Welcome to Corporate Network</h1>\n    <p>Authorized personnel only.</p>\n</body>\n</html>',
                  size: getRandomSize(500, 1000),
                  permissions: '-rw-r--r--',
                  owner: 'www-data',
                  modified: getRandomDate()
                },
                'admin.php': {
                  name: 'admin.php',
                  type: 'file',
                  content: '<?php\n// Admin panel\nif (!isset($_SESSION["admin"])) {\n    header("Location: /login.php");\n    exit();\n}\n\n// Admin functions here\necho "Admin Dashboard";\n?>',
                  size: getRandomSize(800, 1500),
                  permissions: '-rw-r--r--',
                  owner: 'www-data',
                  modified: getRandomDate()
                }
              }
            }
          }
        }
      }
    },
    tmp: {
      name: 'tmp',
      type: 'directory',
      permissions: 'drwxrwxrwt',
      owner: 'root',
      modified: getRandomDate(),
      children: {
        'backup.sql': {
          name: 'backup.sql',
          type: 'file',
          content: '-- Database backup\n-- Generated: ' + new Date().toISOString() + '\n\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    username VARCHAR(50),\n    password_hash VARCHAR(255),\n    email VARCHAR(100)\n);\n\nINSERT INTO users VALUES (1, "admin", "$2y$10$hash", "admin@company.com");',
          size: getRandomSize(10000, 50000),
          permissions: '-rw-r--r--',
          owner: 'root',
          modified: getRandomDate()
        }
      }
    }
  };
};