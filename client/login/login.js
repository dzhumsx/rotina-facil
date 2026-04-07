// Mobile Device Block Check
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768) {
    document.documentElement.innerHTML = '<div style="display:flex;height:100vh;align-items:center;justify-content:center;background:#0f172a;color:#fff;text-align:center;padding:20px;font-family:sans-serif;"><div><h1 style="margin-bottom:10px;">Dispositivo não suportado</h1><p>Esta aplicação não possui suporte a dispositivos móveis.<br>Por favor, acesse via computador.</p></div></div>';
    throw new Error('Acesso bloqueado: dispositivo móvel.');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    localStorage.clear();

    if (loginForm) {
        // Se o botão não for do tipo submit, podemos capturar o clique dele também
        const btnLogin = loginForm.querySelector('.btn-login');
        if (btnLogin && btnLogin.type === "button") {
            btnLogin.addEventListener('click', () => {
                // Dispara o evento de submit manualmente ou apenas executa a função
                loginForm.dispatchEvent(new Event('submit'));
            });
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o recarregamento da página

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Constantes baseadas na estrutura atual do app
            const URL = "http://localhost:3000";

            try {
                // Altera o texto do botão para dar feedback visual
                if (btnLogin) btnLogin.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Entrando...";

                const response = await fetch(URL + "/api/getToken", {
                    method: 'POST',
                    headers: {
                        'authorization': btoa(321),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: email, // enviando email como usuário
                        password: password
                    })
                });

                if (response.ok) {
                    const tokenData = await response.text();
                    console.log("Token gerado:", tokenData);

                    // Salvar o token no local storage (ou session storage) para uso posterior
                    localStorage.setItem('VerificationToken', tokenData);

                    // Redireciona para a página principal após o login com sucesso
                    window.location.href = '../index.html';
                } else {
                    const errorData = await response.json();
                    alert("Erro ao fazer login: " + (errorData.error || "Desconhecido"));

                    // Restaura o botão
                    if (btnLogin) btnLogin.textContent = "Entrar na minha conta";
                }

            } catch (err) {
                console.error("Erro ao conectar na API:", err);
                alert("Falha na conexão com o servidor.");

                // Restaura o texto do botão em caso de erro
                if (btnLogin) btnLogin.textContent = "Entrar na minha conta";
            }
        });
    }
});
