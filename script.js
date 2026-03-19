const terminalView = document.getElementById('terminal-view');
const blogView = document.getElementById('blog-view');
const navTerminal = document.getElementById('nav-terminal');
const navBlog = document.getElementById('nav-blog');

const output = document.getElementById('output');
const input = document.getElementById('cli-input');

function showView(view) {
    if (view === 'terminal') {
        terminalView.classList.remove('hidden');
        blogView.classList.add('hidden');
        navTerminal.classList.add('active-pill');
        navBlog.classList.remove('active-pill');
        input.focus();
    } else {
        terminalView.classList.add('hidden');
        blogView.classList.remove('hidden');
        navTerminal.classList.remove('active-pill');
        navBlog.classList.add('active-pill');
    }
}

navTerminal.addEventListener('click', (e) => {
    e.preventDefault();
    showView('terminal');
});

navBlog.addEventListener('click', (e) => {
    e.preventDefault();
    showView('blog');
});

const COMMAND_LIST = ['help', 'ls', 'cat', 'whoami', 'clear', 'gui', 'uname', 'cd', 'pwd'];
const FILE_LIST = ['about.txt', 'projects/', 'contact.txt', '/etc/hostname', '/etc/os-release'];

const HELP_TEXT = `
Available commands:
  help     - Show this help message
  ls       - List directory contents
  cat      - Read a file
  whoami   - Display user info
  uname    - Display system info
  cd       - Change directory
  pwd      - Print working directory
  clear    - Clear the terminal
  gui      - Open GUI view
`;

const PROJECTS = {
    'presenceforge': 'To be filled lol',
    'neutronlauncher': 'To be filled lol',
    'quantumlauncher': 'To be filled lol',
    'nwpython': 'To be filled lol',
    'ping-pong': 'To be filled lol'
};

const ABOUT_TEXT = `
To be filled lol
`;

function getBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'firefox';
    if (ua.includes('Chrome')) return 'chrome';
    if (ua.includes('Safari')) return 'safari';
    if (ua.includes('Edge')) return 'edge';
    return 'browser';
}

function getOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown OS';
}

const PROMPT_USER = 'sreehari';
const PROMPT_HOST = getBrowser();

const VFS = {
    '/': { type: 'dir', children: ['home', 'etc', 'bin', 'usr', 'var'] },
    '/home': { type: 'dir', children: [PROMPT_USER] },
    [`/home/${PROMPT_USER}`]: { type: 'dir', children: ['about.txt', 'projects', 'contact.txt'] },
    '/etc': { type: 'dir', children: ['hostname', 'os-release'] },
    '/bin': { type: 'dir', children: ['ls', 'cat', 'pwd', 'cd', 'help', 'clear', 'gui', 'uname'] },
    '/usr': { type: 'dir', children: [] },
    '/var': { type: 'dir', children: [] },
    '/etc/hostname': { type: 'file', content: PROMPT_HOST },
    '/etc/os-release': { type: 'file', content: `NAME="${getOS()}"` },
    [`/home/${PROMPT_USER}/about.txt`]: { type: 'file', content: ABOUT_TEXT },
    [`/home/${PROMPT_USER}/contact.txt`]: { type: 'file', content: 'To be filled lol' },
    [`/home/${PROMPT_USER}/projects`]: { type: 'dir', children: Object.keys(PROJECTS) }
};

// Add project files to VFS
for (const [name, content] of Object.entries(PROJECTS)) {
    VFS[`/home/${PROMPT_USER}/projects/${name}`] = { type: 'file', content };
}

let CWD = `/home/${PROMPT_USER}`;
const HOME_DIR = `/home/${PROMPT_USER}`;

function getPromptStr() {
    let displayPath = CWD;
    if (CWD === HOME_DIR) displayPath = '~';
    else if (CWD.startsWith(HOME_DIR)) displayPath = '~' + CWD.slice(HOME_DIR.length);
    return `${PROMPT_USER}@${PROMPT_HOST}:${displayPath}$ `;
}

function resolvePath(path) {
    if (!path) return CWD;
    if (path === '~') return HOME_DIR;
    if (path.startsWith('~')) path = HOME_DIR + path.slice(1);
    
    let absolutePath = path.startsWith('/') ? path : (CWD === '/' ? '/' + path : CWD + '/' + path);
    
    // Normalize path (handle . and ..)
    const parts = absolutePath.split('/').filter(p => p !== '' && p !== '.');
    const stack = [];
    for (const part of parts) {
        if (part === '..') {
            if (stack.length > 0) stack.pop();
        } else {
            stack.push(part);
        }
    }
    
    return '/' + stack.join('/');
}

function addLine(text, className = '') {
    const div = document.createElement('div');
    div.textContent = text;
    if (className) div.classList.add(className);
    output.appendChild(div);
    terminalView.scrollTop = terminalView.scrollHeight;
}

function handleAutocomplete() {
    const val = input.value; // Don't trim here, we need the trailing space info
    const parts = val.trimStart().split(/\s+/);
    
    // If input is empty, do nothing
    if (val.trim() === '') return;

    // Case 1: Autocomplete command (no space after the first word)
    if (parts.length === 1 && !val.endsWith(' ')) {
        const matches = COMMAND_LIST.filter(c => c.startsWith(parts[0]));
        if (matches.length > 1) {
            addLine(`${getPromptStr()}${val}`, 'prompt');
            addLine(matches.join('  '));
        }
    } 
    // Case 2: Autocomplete for commands with arguments
    else if (parts.length >= 2 || (parts.length === 1 && val.endsWith(' '))) {
        const cmd = parts[0];
        const arg = parts[parts.length - 1] || '';
        const isAbsolute = arg.startsWith('/');
        
        let dirPath, search;
        if (arg.includes('/')) {
            const lastSlash = arg.lastIndexOf('/');
            const dirPart = arg.slice(0, lastSlash) || (isAbsolute ? '/' : '.');
            search = arg.slice(lastSlash + 1);
            dirPath = resolvePath(dirPart);
        } else {
            dirPath = CWD;
            search = arg;
        }

        let matches = [];
        if (cmd === 'cat' || cmd === 'cd' || cmd === 'ls') {
            const dir = VFS[dirPath];
            if (dir && dir.type === 'dir') {
                matches = dir.children.filter(f => f.startsWith(search));
            }
        }
        
        if (matches.length === 1) {
            const lastPart = arg.includes('/') ? arg.slice(0, arg.lastIndexOf('/') + 1) + matches[0] : matches[0];
            const newVal = val.slice(0, val.lastIndexOf(arg)) + lastPart;
            input.value = newVal + (VFS[resolvePath(lastPart)]?.type === 'dir' ? '/' : ' ');
        } else if (matches.length > 1) {
            addLine(`${getPromptStr()}${val}`, 'prompt');
            addLine(matches.join('  '));
        }
    }
}

function processCommand(cmd) {
    const args = cmd.toLowerCase().trim().split(/\s+/);
    const command = args[0];

    addLine(`${getPromptStr()}${cmd}`, 'prompt');

    switch (command) {
        case 'help':
            addLine(HELP_TEXT);
            break;
        case 'ls':
            const lsPath = resolvePath(args[1]);
            const lsTarget = VFS[lsPath];
            if (lsTarget && lsTarget.type === 'dir') {
                addLine(lsTarget.children.join('  '));
            } else if (lsTarget && lsTarget.type === 'file') {
                addLine(args[1]);
            } else {
                addLine(`ls: cannot access '${args[1] || ''}': No such file or directory`);
            }
            break;
        case 'cat':
            const catPath = resolvePath(args[1]);
            const catTarget = VFS[catPath];
            if (catTarget && catTarget.type === 'file') {
                addLine(catTarget.content);
            } else if (catTarget && catTarget.type === 'dir') {
                addLine(`cat: ${args[1]}: Is a directory`);
            } else {
                addLine(`cat: ${args[1] || ''}: No such file or directory`);
            }
            break;
        case 'whoami':
            addLine(PROMPT_USER);
            break;
        case 'uname':
            if (args[1] === '-a') {
                addLine(navigator.userAgent);
            } else {
                addLine('Linux');
            }
            break;
        case 'pwd':
            addLine(CWD);
            break;
        case 'cd':
            const newPath = resolvePath(args[1] || '~');
            const target = VFS[newPath];
            if (target && target.type === 'dir') {
                CWD = newPath;
                document.querySelector('.prompt').textContent = getPromptStr();
            } else if (target && target.type === 'file') {
                addLine(`cd: not a directory: ${args[1]}`);
            } else {
                addLine(`cd: no such file or directory: ${args[1]}`);
            }
            break;
        case 'clear':
            output.innerHTML = '';
            break;
        case 'gui':
            showView('blog');
            break;
        case '':
            break;
        default:
            addLine(`command not found: ${command}`);
    }
}

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        processCommand(input.value);
        input.value = '';
    } else if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
    }
});

// Focus input on click anywhere in terminal
terminalView.addEventListener('click', () => {
    input.focus();
});

// Update prompt in HTML
document.querySelector('.prompt').textContent = getPromptStr();

// Initial View
showView('terminal');
