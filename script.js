const terminalView = document.getElementById('terminal-view');
const blogView = document.getElementById('blog-view');
const navTerminal = document.getElementById('nav-terminal');
const navBlog = document.getElementById('nav-blog');

const output = document.getElementById('output');
const input = document.getElementById('cli-input');
const promptEl = document.querySelector('.input-line .prompt'); // cache the REAL prompt span
const navIndicator = document.querySelector('.nav-indicator');

let term = null;
let fitAddon = null;

function initXterm() {
    if (term) return;
    term = new Terminal({
        fontFamily: '"VT323", monospace',
        fontSize: 18,
        allowTransparency: true,
        theme: {
            background: '#00000000',
            foreground: '#FFB000',
            cursor: '#FFB000',
            cursorAccent: '#000',
            selection: 'rgba(255, 176, 0, 0.3)',
        },
        cursorBlink: true,
        cursorStyle: 'block'
    });
    fitAddon = new FitAddon.FitAddon();
    term.loadAddon(fitAddon);
    term.open(document.getElementById('v86-xterm-container'));
    
    // Prevent native keyboard from appearing in xterm on mobile
    if (isMobile()) {
        const xtermTextarea = document.querySelector('.xterm-helper-textarea');
        if (xtermTextarea) {
            xtermTextarea.setAttribute('inputmode', 'none');
            xtermTextarea.setAttribute('readonly', 'readonly');
        }
    }
    
    // Unified input handler to track 'poweroff' and 'exit' commands
    term.onData(data => {
        handleV86Input(data);
    });

    // Watch for size changes using ResizeObserver (handles CSS transitions & un-hiding)
    const resizeObserver = new ResizeObserver(() => {
        if (v86Mode && fitAddon) fitAddon.fit();
    });
    resizeObserver.observe(document.getElementById('v86-xterm-container'));

    window.addEventListener('resize', () => {
        if (v86Mode && fitAddon) fitAddon.fit();
    });
}

function updateNavIndicator(activeElement) {
    if (!navIndicator || !activeElement) return;
    const { offsetLeft, offsetWidth } = activeElement;
    navIndicator.style.transform = `translateY(-50%) translateX(${offsetLeft}px)`;
    navIndicator.style.width = `${offsetWidth}px`;
}

function showView(view) {
    if (view === 'terminal') {
        terminalView.classList.remove('hidden');
        blogView.classList.add('hidden');
        navTerminal.classList.add('active-pill');
        navBlog.classList.remove('active-pill');
        updateNavIndicator(navTerminal);
        input.focus();
    } else {
        terminalView.classList.add('hidden');
        blogView.classList.remove('hidden');
        navTerminal.classList.remove('active-pill');
        navBlog.classList.add('active-pill');
        updateNavIndicator(navBlog);
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

const COMMAND_LIST = ['help', 'ls', 'cat', 'whoami', 'clear', 'gui', 'uname', 'cd', 'pwd', 'uptime', 'date', 'linux', 'boot'];
const FILE_LIST = ['aboutme.txt', 'projects/', 'contact.txt', '/etc/hostname', '/etc/os-release'];

const ROAST_QUOTES = [
    { text: "how did you even get here", weight: 0.3 },
    { text: "where is your keyboard?", weight: 0.2 },
    { text: "did you lose your soul?", weight: 0.1 },
    { text: "this terminal requires a soul... and a keyboard", weight: 0.2 },
    { text: "mobile support: never heard of her", weight: 0.2 }
];

const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 600;
};

const HELP_TEXT = `
Available commands:
  help     - Show this help message
  ls       - List directory contents
  cat      - Read a file
  whoami   - Display user info
  uname    - Display system info
  cd       - Change directory
  pwd      - Print working directory
  uptime   - Display system uptime
  date     - Display current date and time
  clear    - Clear the terminal
  gui      - Open GUI view
  linux    - Boot into real Linux (v86)
`;

const PROJECTS = {
    'presenceforge': '\nA Discord Rich Presence client library in Rust, supporting multiple async runtimes.\nFeatures include Flatpak detection, Unix sockets, and Windows named pipes.\nLink: https://github.com/Sreehari425/presenceforge\n',
    'q6w': '\nPlays videos as your Wayland wallpaper.\nBuilt with wgpu and GStreamer. and it efficent.\nLink: https://github.com/Sreehari425/q6w\n',
    'idk-os': '\nA tiny x86_64 kernel written in Rust.\nBoots to VGA text mode.it can do echo only as of writing this\nLink: https://codeberg.org/sreehari425/idk-os\n',
    'ping-pong': '\nA simple ping pong game combining x86-64 Assembly and C.\nGame logic and collision in pure Assembly, rendering handled by C with SDL2.\nLink: https://github.com/Sreehari425/ping-pong\n',
    'this-website': '\na portfolio that got out of hand.\nstarted as a fake terminal. ended up with a real linux kernel.\nvanilla JS, v86, and a custom buildroot image.\nLink: https://github.com/Sreehari425/Sreehari425.github.io\n'
};

const CONTRIBUTIONS_TEXT = `\nQuantumLauncher by mrmayman\nWine by WineHQ\n`;

const ABOUT_TEXT = `\n
hi, i'm sreehari anil . i enjoy systems programming .
i mainly code in rust, but i know my way around other languages also :)
\n`;

const RICKROLL_QUOTES = [
    "the wise man does not search another man's homework folder\n— Sun Tzu, The Art of War (never said this)",
    "he who expects reward in hidden folders\nshall receive only a british man singing\n— Confucius (definitely never said this)",
    "curiosity is the mother of disappointment\nand disappointment is the mother of character\n— Aristotle (he was busy with other stuff)",
    "the anticipation of treasure\nis itself the punishment\n— Friedrich Nietzsche (would not approve of rickroll)",
    "what you seek is not behind closed doors\nit is behind your own eyes\nalso it was never in the homework folder\n— Sun Tzu, probably",
    "you came. you saw. you got rickrolled.\n— Julius Caesar (if he understood the internet)"
];

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
    [`/home/${PROMPT_USER}`]: { type: 'dir', children: ['aboutme.txt', 'projects', 'contributions.txt', 'contact.txt', 'homework'] },
    '/etc': { type: 'dir', children: ['hostname', 'os-release'] },
    '/bin': { type: 'dir', children: ['ls', 'cat', 'pwd', 'cd', 'help', 'clear', 'gui', 'uname'] },
    '/usr': { type: 'dir', children: [] },
    '/var': { type: 'dir', children: [] },
    '/etc/hostname': { type: 'file', content: PROMPT_HOST },
    '/etc/os-release': { type: 'file', content: `NAME="${getOS()}"` },
    [`/home/${PROMPT_USER}/aboutme.txt`]: { type: 'file', content: ABOUT_TEXT },
    [`/home/${PROMPT_USER}/contact.txt`]: { type: 'file', content: 'Email: sreehari7102008@gmail.com\\nGitHub: https://github.com/Sreehari425\\nCodeberg: https://codeberg.org/sreehari425' },
    [`/home/${PROMPT_USER}/projects`]: { type: 'dir', children: Object.keys(PROJECTS) },
    [`/home/${PROMPT_USER}/contributions.txt`]: { type: 'file', content: CONTRIBUTIONS_TEXT },
    [`/home/${PROMPT_USER}/homework`]: { 
        type: 'dir', 
        children: [], 
        redirect: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        size: '∞'
    }
};

// Add project files to VFS
for (const [name, content] of Object.entries(PROJECTS)) {
    VFS[`/home/${PROMPT_USER}/projects/${name}`] = { type: 'file', content };
}

// Add binaries to VFS
for (const bin of VFS['/bin'].children) {
    VFS[`/bin/${bin}`] = { 
        type: 'file', 
        content: '\x7FELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00>\x00\x01\x00\x00\x00', 
        size: Math.floor(Math.random() * 50000) + 20000 
    };
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
    if (className) div.classList.add(className);
    
    if (typeof text === 'string') {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        let lastIdx = 0;
        let match;
        
        while ((match = urlRegex.exec(text)) !== null) {
            if (match.index > lastIdx) {
                div.appendChild(document.createTextNode(text.slice(lastIdx, match.index)));
            }
            const a = document.createElement('a');
            a.href = match[0];
            a.target = '_blank';
            a.textContent = match[0];
            a.style.color = 'inherit';
            a.style.textDecoration = 'underline';
            div.appendChild(a);
            lastIdx = match.index + match[0].length;
        }
        
        if (lastIdx < text.length) {
            div.appendChild(document.createTextNode(text.slice(lastIdx)));
        }
    } else {
        div.textContent = text;
    }

    output.appendChild(div);
    // Only auto-scroll if we are already near the bottom, or if this was triggered by user input
    // This stops it from hijacking scroll when reading output history
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
        if (matches.length === 1) {
            input.value = matches[0] + ' ';
        } else if (matches.length > 1) {
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

function validateFlags(command, args, allowedFlags) {
    for (const arg of args) {
        if (arg === '--help') continue;
        if (arg.startsWith('--')) {
            addLine(`${command}: unrecognized option '${arg}'`);
            addLine(`Try '${command} --help' for more information.`);
            return false;
        }
        if (arg.startsWith('-') && arg.length > 1) {
            for (let i = 1; i < arg.length; i++) {
                if (!allowedFlags.includes(arg[i])) {
                    addLine(`${command}: invalid option -- '${arg[i]}'`);
                    addLine(`Try '${command} --help' for more information.`);
                    return false;
                }
            }
        }
    }
    return true;
}

function processCommand(cmd) {
    if (!cmd || cmd.trim() === '') return;
    let rawArgs = cmd.trim().split(/\s+/);
    let args = [];

    // Basic wildcard expansion (* only inside arguments)
    for (let i = 0; i < rawArgs.length; i++) {
        const arg = rawArgs[i];
        if (arg.includes('*') && i > 0) {
            const dirSplitIdx = arg.lastIndexOf('/');
            let dirPart = CWD;
            let pattern = arg;

            if (dirSplitIdx >= 0) {
                dirPart = resolvePath(arg.substring(0, dirSplitIdx) || '/');
                pattern = arg.substring(dirSplitIdx + 1);
            }

            const regexStr = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
            const regex = new RegExp(regexStr);

            const dir = VFS[dirPart];
            if (dir && dir.type === 'dir') {
                const matches = dir.children.filter(f => regex.test(f)).sort();
                if (matches.length > 0) {
                    const prefix = (dirSplitIdx >= 0) ? arg.substring(0, dirSplitIdx + 1) : '';
                    matches.forEach(m => args.push(prefix + m));
                } else {
                    args.push(arg);
                }
            } else {
                args.push(arg);
            }
        } else {
            args.push(arg);
        }
    }

    let command = args[0].toLowerCase();

    // Handle path execution like /bin/ls or ./ls in /bin
    if (command.includes('/')) {
        const execPath = resolvePath(command);
        if (execPath.startsWith('/bin/') && VFS[execPath]) {
            command = execPath.split('/').pop();
        }
    }

    addLine(`${getPromptStr()}${cmd}`, 'prompt');

    switch (command) {
        case 'help':
            if (args.includes('--help')) {
                addLine('Usage: help\nDisplay information about built-in commands.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('help', args.slice(1), [])) break;
            addLine(HELP_TEXT);
            break;
        case 'ls': {
            if (args.includes('--help')) {
                addLine('Usage: ls [OPTION]... [FILE]...\nList information about the FILEs (the current directory by default).\n\n  -a, --all                do not ignore entries starting with .\n  -l                       use a long listing format\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('ls', args.slice(1), ['a', 'l'])) break;
            const actualArgs = args.slice(1);
            let lsFiles = actualArgs.filter(a => !a.startsWith('-'));
            let flags = actualArgs.filter(a => a.startsWith('-')).join('');
            const showHidden = flags.includes('a');
            const longFormat = flags.includes('l');
            
            if (lsFiles.length === 0) lsFiles = ['.'];
            
            let dirs = [];
            let files = [];
            let notFound = [];
            
            lsFiles.forEach(f => {
                const path = resolvePath(f);
                const target = VFS[path];
                if (!target) notFound.push(f);
                else if (target.type === 'dir') dirs.push({name: f, path});
                else files.push({name: f, path, target});
            });
            
            notFound.forEach(f => addLine(`ls: cannot access '${f}': No such file or directory`));
            
            if (files.length > 0) {
                if (longFormat) {
                    files.forEach(f => {
                        const date = 'Mar 20 01:13';
                        const size = f.target.size !== undefined ? f.target.size : (f.target.content ? f.target.content.length : 0);
                        addLine(`-rw-r--r--  1 ${PROMPT_USER} ${PROMPT_USER} ${size.toString().padStart(8)} ${date} ${f.name}`);
                    });
                } else {
                    addLine(files.map(f => f.name).join('  '));
                }
            }
            
            dirs.forEach((d, i) => {
                if (lsFiles.length > 1) {
                    if (files.length > 0 || i > 0) addLine('');
                    addLine(`${d.name}:`);
                }
                
                let items = [...VFS[d.path].children];
                if (showHidden) items = ['.', '..', ...items];
                
                if (longFormat) {
                    addLine(`total ${items.length * 4}`);
                    items.forEach(item => {
                        let itemPath = d.path === '/' ? `/${item}` : `${d.path}/${item}`;
                        if (item === '.') itemPath = d.path;
                        if (item === '..') itemPath = resolvePath(d.path + '/..');
                        
                        const entry = VFS[itemPath];
                        const isDir = entry?.type === 'dir';
                        const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                        const size = entry?.size !== undefined ? entry.size : (isDir ? 4096 : (entry?.content ? entry.content.length : 0));
                        const date = 'Mar 20 01:13';
                        addLine(`${perms}  1 ${PROMPT_USER} ${PROMPT_USER} ${size.toString().padStart(8)} ${date} ${item}`);
                    });
                } else {
                    addLine(items.join('  '));
                }
            });
            break;
        }
        case 'cat':
            if (args.includes('--help')) {
                addLine('Usage: cat [FILE]...\nConcatenate FILE(s) to standard output.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('cat', args.slice(1), [])) break;
            if (!args[1]) {
                addLine('usage: cat <file>');
                break;
            }
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
            if (args.includes('--help')) {
                addLine('Usage: whoami [OPTION]...\nPrint the user name associated with the current effective user ID.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('whoami', args.slice(1), [])) break;
            addLine(PROMPT_USER);
            break;
        case 'uname':
            if (args.includes('--help')) {
                addLine('Usage: uname [OPTION]...\nPrint certain system information.  With no OPTION, same as -s.\n\n  -a, --all                print all information\n  -s, --kernel-name        print the kernel name\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('uname', args.slice(1), ['a', 's'])) break;
            if (args.includes('-a')) {
                addLine(navigator.userAgent);
            } else {
                addLine('Linux');
            }
            break;
        case 'pwd':
            if (args.includes('--help')) {
                addLine('Usage: pwd [OPTION]...\nPrint the full filename of the current working directory.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('pwd', args.slice(1), [])) break;
            addLine(CWD);
            break;
        case 'cd':
            if (args.includes('--help')) {
                addLine('Usage: cd [DIRECTORY]\nChange the shell working directory.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('cd', args.slice(1), [])) break;
            const newPath = resolvePath(args[1] || '~');
            const target = VFS[newPath];
            if (target && target.type === 'dir') {
                if (target.redirect) {
                    window.open(target.redirect, '_blank');
                    const quote = RICKROLL_QUOTES[Math.floor(Math.random() * RICKROLL_QUOTES.length)];
                    addLine(quote);
                } else {
                    CWD = newPath;
                    if (!v86Mode) {
                        const prompt = getPromptStr();
                        promptEl.textContent = prompt;
                        document.title = prompt.trim();
                    }
                }
            } else if (target && target.type === 'file') {
                addLine(`cd: not a directory: ${args[1]}`);
            } else {
                addLine(`cd: no such file or directory: ${args[1]}`);
            }
            break;
        case 'uptime':
            if (args.includes('--help')) {
                addLine('Usage: uptime [options]\nDisplay how long the system has been running.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('uptime', args.slice(1), [])) break;
            addLine(`${new Date().toTimeString().split(' ')[0]} up never, load average: never heard of her`);
            break;
        case 'date': {
            if (args.includes('--help')) {
                addLine('Usage: date [OPTION]...\nDisplay the current time in the given FORMAT, or set the system date.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('date', args.slice(1), [])) break;
            const dNow = new Date();
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const day = days[dNow.getDay()];
            const month = months[dNow.getMonth()];
            const date = dNow.getDate().toString().padStart(2, '0');
            const hours = dNow.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const h12 = (hours % 12 || 12).toString().padStart(2, '0');
            const mins = dNow.getMinutes().toString().padStart(2, '0');
            const secs = dNow.getSeconds().toString().padStart(2, '0');
            const year = dNow.getFullYear();
            addLine(`${day} ${month} ${date} ${h12}:${mins}:${secs} ${ampm} IST ${year}`);
            break;
        }
        case 'clear':
            if (args.includes('--help')) {
                addLine('Usage: clear\nClear the terminal screen.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('clear', args.slice(1), [])) break;
            output.innerHTML = '';
            break;
        case 'gui':
            if (args.includes('--help')) {
                addLine('Usage: gui\nOpen the graphical user interface (blog view).\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags('gui', args.slice(1), [])) break;
            showView('blog');
            break;
        case 'linux':
        case 'boot':
            if (args.includes('--help')) {
                addLine('Usage: linux | boot\nBoot into a real Linux kernel via v86 emulation.\n\n      --help     display this help and exit');
                break;
            }
            if (!validateFlags(command, args.slice(1), [])) break;
            startV86();
            break;
        case '':
            break;
        default:
            addLine(`command not found: ${command}`);
    }
}

let emulator = null;
let v86Mode = false;        // true when Linux is running
let v86InputBuffer = '';

function handleV86Input(data) {
    if (!v86Mode || !emulator) return;
    
    // Always send the data to the serial console
    emulator.serial0_send(data);
    
    // Track inputs for poweroff/exit detection (one or more characters)
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        if (char === '\r' || char === '\n') {
            const cmd = v86InputBuffer.trim().toLowerCase();
            v86InputBuffer = '';
            if (cmd === 'poweroff' || cmd.endsWith('poweroff')) {
                // Wait 1.5s for command to execute before stopping emulator
                setTimeout(() => { if (emulator) emulator.stop(); }, 1500);
            }
        } else if (char === '\x7f' || char === '\b') {
            v86InputBuffer = v86InputBuffer.slice(0, -1);
        } else {
            // Keep only alphanumeric characters for command detection (no spaces/symbols for simplicity)
            v86InputBuffer += char.replace(/[^a-zA-Z]/g, '');
        }
    }
}

// Pipe a byte from v86 serial into our terminal, stripping ANSI escapes
// handleSerialOutput removed since xterm handles ANSI natively

function startV86() {
    if (emulator) {
        addLine("Linux is already running. Type commands below — you're talking to a real kernel!");
        return;
    }

    const V86Class = typeof V86 !== 'undefined' ? V86 : (typeof V86Starter !== 'undefined' ? V86Starter : null);
    if (!V86Class) {
        addLine('Error: libv86.js failed to load. Run the site via a local HTTP server (not file://).', 'error');
        return;
    }

    addLine("── Booting real Linux kernel via WASM ──────────────────────", "dim");
    addLine("Kernel output will stream here. Auto-logging in as root...", "dim");
    addLine("Note: to go back to default terminal use poweroff", "dim");

    addLine("────────────────────────────────────────────────────────────", "dim");

    try {
        emulator = new V86Class({
            wasm_path: "v86.wasm",
            memory_size: 32 * 1024 * 1024,
            vga_memory_size: 2 * 1024 * 1024,
            bios: { url: "bios/seabios.bin" },
            vga_bios: { url: "bios/vgabios.bin" },
            cdrom: { url: "images/v86-linux.iso" },
            autostart: true,
            disable_keyboard: true,
            disable_mouse: true,
            disable_speaker: true,
            cmdline: "rw root=/dev/sr0 console=ttyS0",
        });

        // Switch to Linux mode immediately
        v86Mode = true;
        
        // Hide mock terminal interface, launch xterm
        output.classList.add('hidden');
        document.querySelector('.input-line').classList.add('hidden');
        document.querySelector('.header-text').classList.add('hidden');
        document.getElementById('v86-xterm-container').classList.remove('hidden');
        terminalView.classList.add('linux-mode');
        terminalView.scrollTop = 0; // Ensure we start at the top to clear the fixed navbar
        
        if (isMobile()) updateMobileSuggestions('linux');
        
        initXterm();
        fitAddon.fit();
        term.focus();

        term.write('\x1b[33m\r\n' +
            '   _____                  _                 _\r\n' +
            '  / ____|                | |               (_)\r\n' +
            ' | (___  _ __ ___  ___| |__   __ _ _ __ _ \r\n' +
            '  \\___ \\| \'__/ _ \\/ _ \\ \'_ \\ / _` | \'__| |\r\n' +
            '  ____) | | |  __/  __/ | | | (_| | |  | |\r\n' +
            ' |_____/|_|  \\___|\\___|_| |_|\\__,_|_|  |_|\r\n' +
            '                                           \r\n' +
            ' [ LINUX KERNEL INITIALIZED ]\r\n' +
            ' [ NOTE: WAIT FOR THE ROOT LOGIN ]\r\n' +
            ' [ TYPE "poweroff" TO RETURN ]\r\n' +
            '\x1b[0m\r\n\r\n');

        // Pipe serial0 output directly into xterm!
        let loginSent = false;
        let loginBuffer = '';
        
        emulator.add_listener("serial0-output-byte", (charCode) => {
            // 0xFF (255) is a spurious serial artifact from v86's emulation
            // that renders as ÿ  skip it entirely
            // i have no idea why it comes but it does work 
            if (charCode === 0xFF) return;
            const char = String.fromCharCode(charCode);
            if (term) term.write(char);
            
            // Auto-login logic
            if (!loginSent) {
                loginBuffer += char;
                if (loginBuffer.toLowerCase().includes('login:')) {
                    loginSent = true;
                    setTimeout(() => {
                        emulator.serial0_send("root\n");
                        // Send a clear after a further delay to clean up any stray
                        // characters (e.g. a lone "ÿ") that appear from the kernel
                        // boot sequence before the shell prompt settles
                        setTimeout(() => {
                            emulator.serial0_send("clear\n");
                        }, 1500);
                    }, 500); // 500ms delay to let prompt render fully
                }
                if (loginBuffer.length > 200) loginBuffer = loginBuffer.slice(-100);
            }
        });

        let hasHalted = false;
        emulator.add_listener("emulator-stopped", () => {
            if (hasHalted) return;
            hasHalted = true;
            // Restore Fake Terminal
            document.getElementById('v86-xterm-container').classList.add('hidden');
            output.classList.remove('hidden');
            document.querySelector('.input-line').classList.remove('hidden');
            document.querySelector('.header-text').classList.remove('hidden');
            terminalView.classList.remove('linux-mode');
            
            if (isMobile()) updateMobileSuggestions('mock');
            
            addLine("\n── Linux kernel halted ──", "error");
            v86Mode = false;
            emulator = null;
            
            const origPrompt = getPromptStr();
            promptEl.textContent = origPrompt;
            document.title = origPrompt.trim();
            // Optional: don't aggressively focus input to allow scrolling
            // input.focus();
        });

    } catch (e) {
        // Restore Fake Terminal
        document.getElementById('v86-xterm-container').classList.add('hidden');
        output.classList.remove('hidden');
        document.querySelector('.input-line').classList.remove('hidden');
        document.querySelector('.header-text').classList.remove('hidden');
        terminalView.classList.remove('linux-mode');
        
        addLine(`Failed to start emulator: ${e.message}`, "error");
        emulator = null;
        v86Mode = false;
        promptEl.textContent = getPromptStr();
        input.placeholder = '';
        input.focus();
    }
}

input.addEventListener('keydown', (e) => {
    if (v86Mode && emulator) {
        const sendStr = (s) => emulator.serial0_send(s);

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                const v86Cmd = input.value.trim();
                sendStr(input.value + '\n');
                input.value = '';
                
                // If the user types poweroff, let's gracefully stop the emulator
                // after a short delay to let the command run
                if (v86Cmd === 'poweroff') {
                    setTimeout(() => {
                        if (emulator) {
                            emulator.stop();
                        }
                    }, 1500); // give it 1.5s to print shutdown messages
                }
                break;
            case 'Backspace':
                e.preventDefault();
                handleV86Input('\x7f');
                break;
            case 'Tab':
                e.preventDefault();
                handleV86Input('\t');
                break;
            case 'ArrowUp':
                e.preventDefault();
                handleV86Input('\x1b[A');
                break;
            case 'ArrowDown':
                e.preventDefault();
                handleV86Input('\x1b[B');
                break;
            case 'ArrowRight':
                e.preventDefault();
                handleV86Input('\x1b[C');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                handleV86Input('\x1b[D');
                break;
            case 'Enter':
                e.preventDefault();
                handleV86Input('\n');
                break;
            default:
                if (e.ctrlKey && e.key.length === 1) {
                    e.preventDefault();
                    // Ctrl+C = \x03, Ctrl+D = \x04, etc.
                    sendStr(String.fromCharCode(e.key.toUpperCase().charCodeAt(0) - 64));
                }
                // Regular printable chars: let the browser handle typing into
                // the input box normally; they'll be sent on Enter
        }
        return;
    }

    // Normal mock terminal mode
    if (e.key === 'Enter') {
        processCommand(input.value);
        input.value = '';
    } else if (e.key === 'Tab') {
        e.preventDefault();
        handleAutocomplete();
    }
});

// Focus input on click anywhere in terminal (works in both mock and Linux mode)
terminalView.addEventListener('click', (e) => {
    // Prevent focus stealing if user is selecting text
    if (window.getSelection().toString().trim().length > 0) return;
    
    // Prevent focus stealing if clicking a link
    if (e.target.tagName === 'A') return;

    // Ignore clicks on the scrollbar
    if (e.offsetX > e.target.clientWidth) return;

    if (v86Mode && term) {
        term.focus();
    } else {
        input.focus({ preventScroll: true });
    }
});

// Update prompt in HTML
const initialPrompt = getPromptStr();
promptEl.textContent = initialPrompt;
document.title = initialPrompt.trim();

function initKeyboard() {
    const keyboard = document.getElementById('keyboard');
    keyboard.classList.remove('hidden');

    const layout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
        ['Tab', 'Space', '/', '-', '.', 'Enter']
    ];

    layout.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        row.forEach(key => {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key';
            keyDiv.textContent = key;
            
            if (key === 'Space') keyDiv.classList.add('space');
            if (['Tab', 'Enter', '⌫'].includes(key)) keyDiv.classList.add('wide');
            if (['Enter', 'Tab'].includes(key)) keyDiv.classList.add('special');

            keyDiv.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (key === '⌫') {
                    if (v86Mode && emulator) {
                        handleV86Input('\x7f');
                    } else {
                        input.value = input.value.slice(0, -1);
                    }
                } else if (key === 'Enter') {
                    if (v86Mode && emulator) {
                        handleV86Input('\n');
                    } else {
                        processCommand(input.value);
                        input.value = '';
                    }
                } else if (key === 'Tab') {
                    if (v86Mode && emulator) {
                        handleV86Input('\t');
                    } else {
                        handleAutocomplete();
                    }
                } else if (key === 'Space') {
                    if (v86Mode && emulator) {
                        handleV86Input(' ');
                    } else {
                        input.value += ' ';
                    }
                } else {
                    if (v86Mode && emulator) {
                        handleV86Input(key);
                    } else {
                        input.value += key;
                    }
                }
                
                if (v86Mode && term) {
                    term.focus();
                } else {
                    input.focus();
                }
            };
            rowDiv.appendChild(keyDiv);
        });
        keyboard.appendChild(rowDiv);
    });
}

function updateMobileSuggestions(mode) {
    const suggestionsContainer = document.getElementById('suggestions');
    if (!suggestionsContainer) return;
    
    suggestionsContainer.classList.remove('hidden');
    suggestionsContainer.innerHTML = '';
    const commands = mode === 'linux' ? ['poweroff', 'ls', 'vi', 'Esc', 'Ctrl+C', 'Ctrl+Z', 'Ctrl+D'] : ['ls', 'help', 'whoami', 'uptime', 'gui'];
    
    commands.forEach(cmd => {
        const span = document.createElement('span');
        span.className = 'suggestion-tag';
        span.textContent = cmd;
        span.onclick = () => {
            if (mode === 'linux' && emulator) {
                if (cmd === 'Esc') {
                    handleV86Input('\x1b');
                } else if (cmd === 'Ctrl+C') {
                    handleV86Input('\x03');
                } else if (cmd === 'Ctrl+Z') {
                    handleV86Input('\x1a');
                } else if (cmd === 'Ctrl+D') {
                    handleV86Input('\x04');
                } else {
                    handleV86Input(cmd + '\n');
                }
                if (term) term.focus();
            } else {
                processCommand(cmd);
                input.value = '';
                input.focus();
            }
        };
        suggestionsContainer.appendChild(span);
    });
}

function initMobileSupport() {
    if (!isMobile()) return;
    document.body.classList.add('is-mobile');

    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.classList.remove('hidden');

    // Prevent native keyboard from appearing
    input.setAttribute('inputmode', 'none');

    initKeyboard();
    updateMobileSuggestions('mock');

    // Probability-based roast
    const rand = Math.random();
    let cumulative = 0;
    let selectedQuote = ROAST_QUOTES[0].text;
    for (const q of ROAST_QUOTES) {
        cumulative += q.weight;
        if (rand < cumulative) {
            selectedQuote = q.text;
            break;
        }
    }

    addLine("bash: error: no keyboard detected", "error");
    addLine(`       ${selectedQuote}`);
    addLine("\nthis terminal requires:");
    addLine("- a keyboard");
    addLine("- a soul");
    addLine("- basic linux knowledge");
}

// Initial View
showView('terminal');

// Auto-run commands
processCommand('help');
processCommand('ls');

initMobileSupport();
// Add resize listener to update indicator position
window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-links a.active-pill');
    updateNavIndicator(activeLink);
});
