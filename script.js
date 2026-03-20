const terminalView = document.getElementById('terminal-view');
const blogView = document.getElementById('blog-view');
const navTerminal = document.getElementById('nav-terminal');
const navBlog = document.getElementById('nav-blog');

const output = document.getElementById('output');
const input = document.getElementById('cli-input');
const promptEl = document.querySelector('.input-line .prompt'); // cache the REAL prompt span
const navIndicator = document.querySelector('.nav-indicator');

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
const FILE_LIST = ['about.txt', 'projects/', 'contact.txt', '/etc/hostname', '/etc/os-release'];

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
    'presenceforge': 'To be filled lol',
    'neutronlauncher': 'To be filled lol',
    'nwpython': 'To be filled lol',
    'ping-pong': 'To be filled lol'
};

const ABOUT_TEXT = `
To be filled lol
`;

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
    [`/home/${PROMPT_USER}`]: { type: 'dir', children: ['about.txt', 'projects', 'contact.txt', 'homework'] },
    '/etc': { type: 'dir', children: ['hostname', 'os-release'] },
    '/bin': { type: 'dir', children: ['ls', 'cat', 'pwd', 'cd', 'help', 'clear', 'gui', 'uname'] },
    '/usr': { type: 'dir', children: [] },
    '/var': { type: 'dir', children: [] },
    '/etc/hostname': { type: 'file', content: PROMPT_HOST },
    '/etc/os-release': { type: 'file', content: `NAME="${getOS()}"` },
    [`/home/${PROMPT_USER}/about.txt`]: { type: 'file', content: ABOUT_TEXT },
    [`/home/${PROMPT_USER}/contact.txt`]: { type: 'file', content: 'To be filled lol' },
    [`/home/${PROMPT_USER}/projects`]: { type: 'dir', children: Object.keys(PROJECTS) },
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

function processCommand(cmd) {
    const args = cmd.toLowerCase().trim().split(/\s+/);
    const command = args[0];

    addLine(`${getPromptStr()}${cmd}`, 'prompt');

    switch (command) {
        case 'help':
            addLine(HELP_TEXT);
            break;
        case 'ls':
            const actualArgs = args.slice(1);
            let lsFiles = actualArgs.filter(a => !a.startsWith('-'));
            let flags = actualArgs.filter(a => a.startsWith('-')).join('');
            const showHidden = flags.includes('a');
            const longFormat = flags.includes('l');
            
            const lsPath = resolvePath(lsFiles[0]);
            const lsTarget = VFS[lsPath];
            
            if (lsTarget && lsTarget.type === 'dir') {
                let items = [...lsTarget.children];
                if (showHidden) items = ['.', '..', ...items];
                
                if (longFormat) {
                    addLine(`total ${items.length * 4}`);
                    items.forEach(item => {
                        let itemPath = lsPath === '/' ? `/${item}` : `${lsPath}/${item}`;
                        if (item === '.') itemPath = lsPath;
                        if (item === '..') itemPath = resolvePath(lsPath + '/..');
                        
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
            } else if (lsTarget && lsTarget.type === 'file') {
                if (longFormat) {
                    const date = 'Mar 20 01:13';
                    const size = lsTarget.content ? lsTarget.content.length : 0;
                    addLine(`-rw-r--r--  1 ${PROMPT_USER} ${PROMPT_USER} ${size.toString().padStart(8)} ${date} ${lsFiles[0]}`);
                } else {
                    addLine(lsFiles[0]);
                }
            } else {
                addLine(`ls: cannot access '${lsFiles[0] || ''}': No such file or directory`);
            }
            break;
        case 'cat':
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
            addLine(`${new Date().toTimeString().split(' ')[0]} up never, load average: never heard of her`);
            break;
        case 'date':
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
        case 'clear':
            output.innerHTML = '';
            break;
        case 'gui':
            showView('blog');
            break;
        case 'linux':
        case 'boot':
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
let linuxLineBuffer = '';   // buffer for building output lines
let ansiEscBuf = null;      // non-null while buffering an ANSI escape sequence

// Pipe a byte from v86 serial into our terminal, stripping ANSI escapes
function handleSerialOutput(charCode) {
    const ch = String.fromCharCode(charCode);

    // --- ANSI escape sequence state machine ---
    if (ansiEscBuf !== null) {
        ansiEscBuf += ch;
        // CSI sequences (ESC[...) end with a letter A-Z / a-z
        // OSC sequences (ESC]...) end with BEL (0x07) or ESC\
        const done =
            (ansiEscBuf.length >= 2 && /[A-Za-z]/.test(ch)) || // CSI/private end
            charCode === 7 ||                                     // BEL ends OSC
            (ansiEscBuf.length >= 2 && ansiEscBuf.slice(-2) === '\x1b\\'); // ST
        if (done || ansiEscBuf.length > 64) { ansiEscBuf = null; }
        return; // always throw away escape content
    }
    if (ch === '\x1b') { ansiEscBuf = ''; return; } // start escape sequence

    // --- Normal character handling ---
    if (ch === '\r') { return; } // ignore CR

    if (ch === '\n') {
        // Only flush non-empty, non-prompt lines to output
        if (linuxLineBuffer.trim()) {
            const div = document.createElement('div');
            div.textContent = linuxLineBuffer;
            div.style.whiteSpace = 'pre';
            output.appendChild(div);
        }
        linuxLineBuffer = '';
        terminalView.scrollTop = terminalView.scrollHeight;
    } else if (ch === '\b' || charCode === 127) {
        linuxLineBuffer = linuxLineBuffer.slice(0, -1);
    } else if (charCode >= 32 || ch === '\t') {
        linuxLineBuffer += ch;

        // Detect shell prompts: ends with "% ", "# ", "$ " (with at least 1 char before)
        // Match after the space so we catch "/root% " as a full unit
        if (v86Mode && ch === ' ' && /[\$#%] $/.test(linuxLineBuffer) && linuxLineBuffer.trim().length > 1) {
            const promptText = linuxLineBuffer.trimEnd();
            promptEl.textContent = promptText + ' ';
            linuxLineBuffer = ''; // consume — don't print to output
        }
    }
}

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
    addLine("────────────────────────────────────────────────────────────", "dim");

    try {
        emulator = new V86Class({
            wasm_path: "v86.wasm",
            memory_size: 32 * 1024 * 1024,
            vga_memory_size: 2 * 1024 * 1024,
            bios: { url: "bios/seabios.bin" },
            vga_bios: { url: "bios/vgabios.bin" },
            cdrom: { url: "images/linux.iso" },
            autostart: true,
            cmdline: "rw root=/dev/sr0 console=ttyS0",
        });

        // Switch to Linux mode immediately — update prompt right away
        v86Mode = true;
        const linuxPrompt = 'root@buildroot:~# ';
        promptEl.textContent = linuxPrompt;
        document.title = 'root@buildroot:~#';
        input.placeholder = "Linux is booting... type commands and press Enter";
        input.focus();

        // Pipe serial0 output into our terminal
        // Also watch for the login prompt and auto-login as root
        let loginSent = false;
        emulator.add_listener("serial0-output-byte", (charCode) => {
            handleSerialOutput(charCode);
            // Auto-login: if we see "login:" in the buffer, send "root\n"
            if (!loginSent && linuxLineBuffer.toLowerCase().includes('login:')) {
                loginSent = true;
                setTimeout(() => {
                    emulator.serial0_send("root\n");
                    input.placeholder = "Type Linux commands here, press Enter to send";
                }, 200);
            }
        });

        emulator.add_listener("emulator-stopped", () => {
            addLine("\n── Linux kernel halted ──", "error");
            v86Mode = false;
            emulator = null;
            loginSent = false;
            const origPrompt = getPromptStr();
            promptEl.textContent = origPrompt;
            document.title = origPrompt.trim();
            input.placeholder = '';
        });

    } catch (e) {
        addLine(`Failed to start emulator: ${e.message}`, "error");
        emulator = null;
        v86Mode = false;
        promptEl.textContent = getPromptStr();
        input.placeholder = '';
    }
}

input.addEventListener('keydown', (e) => {
    if (v86Mode && emulator) {
        const sendStr = (s) => emulator.serial0_send(s);

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                sendStr(input.value + '\n');
                input.value = '';
                break;
            case 'Backspace':
                // Let backspace edit the input field normally; also send DEL to Linux
                sendStr('\x7f');
                break;
            case 'Tab':
                e.preventDefault();
                sendStr('\t');
                break;
            case 'ArrowUp':
                e.preventDefault();
                sendStr('\x1b[A');
                break;
            case 'ArrowDown':
                e.preventDefault();
                sendStr('\x1b[B');
                break;
            case 'ArrowRight':
                e.preventDefault();
                sendStr('\x1b[C');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                sendStr('\x1b[D');
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
terminalView.addEventListener('click', () => {
    input.focus();
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
                if (emulator) return; // Don't run mock commands if v86 is up
                e.preventDefault();
                e.stopPropagation();
                
                if (key === '⌫') {
                    input.value = input.value.slice(0, -1);
                } else if (key === 'Enter') {
                    processCommand(input.value);
                    input.value = '';
                } else if (key === 'Tab') {
                    handleAutocomplete();
                } else if (key === 'Space') {
                    input.value += ' ';
                } else {
                    input.value += key;
                }
                input.focus();
            };
            rowDiv.appendChild(keyDiv);
        });
        keyboard.appendChild(rowDiv);
    });
}

function initMobileSupport() {
    if (!isMobile()) return;

    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.classList.remove('hidden');

    // Prevent native keyboard from appearing
    input.setAttribute('inputmode', 'none');

    initKeyboard();

    const commonCommands = ['ls', 'help', 'whoami', 'uptime', 'gui'];
    commonCommands.forEach(cmd => {
        const span = document.createElement('span');
        span.className = 'suggestion-tag';
        span.textContent = cmd;
        span.onclick = () => {
            if (emulator) return; // Don't run mock commands if v86 is up
            processCommand(cmd);
            input.value = '';
            input.focus();
        };
        suggestionsContainer.appendChild(span);
    });

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
