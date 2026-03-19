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
        navTerminal.classList.add('active-pill'); // Terminal active
        navBlog.classList.remove('active-pill'); // Blog inactive
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

const HELP_TEXT = `
Available commands:
  help     - Show this help message
  ls       - List projects
  cat      - Read a file (e.g., cat about.txt)
  whoami   - Display user info
  clear    - Clear the terminal
  gui      - Open GUI view (placeholder)
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

function addLine(text, className = '') {
    const div = document.createElement('div');
    div.textContent = text;
    if (className) div.classList.add(className);
    output.appendChild(div);
    terminalView.scrollTop = terminalView.scrollHeight;
}

function processCommand(cmd) {
    const args = cmd.toLowerCase().trim().split(' ');
    const command = args[0];

    addLine(`sreehari@portfolio:~$ ${cmd}`, 'prompt');

    switch (command) {
        case 'help':
            addLine(HELP_TEXT);
            break;
        case 'ls':
            addLine('projects/  about.txt  contact.txt');
            break;
        case 'cat':
            if (args[1] === 'about.txt') {
                addLine(ABOUT_TEXT);
            } else if (args[1] === 'projects/' || args[1] === 'projects') {
                addLine('Use "ls projects" to see the list.');
            } else if (args[1] === 'contact.txt') {
                addLine('To be filled lol');
            } else if (PROJECTS[args[1]]) {
                addLine(`${args[1]}: ${PROJECTS[args[1]]}`);
            } else {
                addLine(`cat: ${args[1] || ''}: No such file or directory`);
            }
            break;
        case 'whoami':
            addLine('sreehari_anil');
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
    }
});

// Focus input on click anywhere in terminal
terminalView.addEventListener('click', () => {
    input.focus();
});

// Initial View
showView('terminal');
