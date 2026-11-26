// --- 1. SALVAR CADASTRO E ENVIAR PARA STATIC FORMS (cadastro.html) ---
const formCadastro = document.getElementById('form-cadastro');
if (formCadastro) {
    formCadastro.addEventListener('submit', async function (event) {
        event.preventDefault();

        const novoUsuario = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value.trim().toLowerCase(),
            senha: document.getElementById('senha').value,
            tipo: document.getElementById('tipo').value
        };

        // Salva na lista de usuários cadastrados
        let listaUsuarios = JSON.parse(localStorage.getItem('usuariosBairroResolve')) || [];
        listaUsuarios.push(novoUsuario);
        localStorage.setItem('usuariosBairroResolve', JSON.stringify(listaUsuarios));

        // Envia para o Static Forms em segundo plano sem sair do site
        const dadosFormulario = new FormData(formCadastro);
        try {
            await fetch('https://staticforms.dev', {
                method: 'POST',
                body: dadosFormulario
            });
        } catch (erro) {
            console.log('Envio concluído');
        }

        // Já entra logado e redireciona direto para o início
        localStorage.setItem('usuarioLogado', JSON.stringify(novoUsuario));
        window.location.href = 'index.html';
    });
}

// --- 2. VALIDAR LOGIN (login.html) ---
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', function (event) {
        event.preventDefault();

        const emailDigitado = document.getElementById('email').value.trim().toLowerCase();
        const senhaDigitada = document.getElementById('senha').value;

        // Junta as contas criadas no navegador com a conta padrão de teste
        const listaUsuarios = JSON.parse(localStorage.getItem('usuariosBairroResolve')) || [];
        const contaDemo = {
            nome: 'Visitante Bairro Resolve',
            email: 'teste@bairroresolve.com',
            senha: '1234',
            tipo: 'Cliente'
        };
        const todasContas = [...listaUsuarios, contaDemo];

        const usuarioEncontrado = todasContas.find(
            u => u.email === emailDigitado && u.senha === senhaDigitada
        );

        if (usuarioEncontrado) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
            window.location.href = 'index.html';
        } else {
            const msgErro = document.getElementById('mensagem-erro');
            if (msgErro) msgErro.style.display = 'block';
        }
    });
}

// --- 3. MOSTRAR USUÁRIO LOGADO NO TOPO (index.html e profissionais.html) ---
const areaUsuario = document.getElementById('area-usuario');
if (areaUsuario) {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (usuarioLogado) {
        const primeiroNome = usuarioLogado.nome.split(' ')[0];
        areaUsuario.innerHTML = `
            <span style="font-weight: 600; color: var(--cor-texto); align-self: center;">
                Olá, ${primeiroNome} (${usuarioLogado.tipo})
            </span>
            <button onclick="sairDaConta()" class="botao botao-contorno">Sair</button>
        `;
    }
}

function sairDaConta() {
    localStorage.removeItem('usuarioLogado');
    window.location.reload();
}

// --- 4. BUSCA E FILTRO DE PROFISSIONAIS (profissionais.html) ---
function filtrarCategoria(categoria) {
    window.location.href = `profissionais.html?servico=${encodeURIComponent(categoria)}`;
}

function filtrarPorBotao(categoria) {
    document.getElementById('filtro-servico').value = categoria;
    aplicarFiltros();
}

function aplicarFiltros() {
    const termoServico = document.getElementById('filtro-servico').value.toLowerCase();
    const termoBairro = document.getElementById('filtro-bairro').value.toLowerCase();
    const cartoes = document.querySelectorAll('.cartao-profissional');
    let encontrados = 0;

    cartoes.forEach(cartao => {
        const textoCartao = cartao.innerText.toLowerCase();
        const bateServico = textoCartao.includes(termoServico);
        const bateBairro = textoCartao.includes(termoBairro);

        if (bateServico && bateBairro) {
            cartao.style.display = 'flex';
            encontrados++;
        } else {
            cartao.style.display = 'none';
        }
    });

    const aviso = document.getElementById('aviso-sem-resultado');
    if (aviso) {
        aviso.style.display = encontrados === 0 ? 'block' : 'none';
    }
}

if (document.getElementById('lista-profissionais')) {
    const params = new URLSearchParams(window.location.search);
    const servicoUrl = params.get('servico') || '';
    const bairroUrl = params.get('bairro') || '';

    document.getElementById('filtro-servico').value = servicoUrl;
    document.getElementById('filtro-bairro').value = bairroUrl;
    aplicarFiltros();
}
