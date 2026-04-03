document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    localStorage.clear();

    if (registerForm) {
        // Se o botão não for do tipo submit, podemos capturar o clique dele também
        const btnLogin = registerForm.querySelector('.btn-login');
        if (btnLogin && btnLogin.type === "button") {
            btnLogin.addEventListener('click', () => {
                // Dispara o evento de submit manualmente ou apenas executa a função
                registerForm.dispatchEvent(new Event('submit'));
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Impede o recarregamento da página

            const nome = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Constantes baseadas na estrutura atual do app
            const URL = "http://localhost:3000";

            try {
                // Altera o texto do botão para dar feedback visual
                if (btnLogin) btnLogin.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Cadastrando...";

                const response = await fetch(URL + "/api/register", {
                    method: 'POST',
                    headers: {
                        'authorization': btoa(321),
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome: nome,
                        user: email, // enviando email como usuário
                        password: password
                    })
                });

                if (response.status === 200) {
                    alert(await response.text());
                    // Redireciona para o login
                    window.location.href = './index.html';
                } else if (response.status === 400) {
                    alert("Usuário já cadastrado");
                } else {
                    alert("Erro ao fazer cadastro: " + (await response.text() || "Desconhecido"));
                }

                // Restaura o botão
                if (btnLogin) btnLogin.textContent = "Criar minha conta";
            }
            catch (err) {
                console.error("Erro ao conectar na API:", err);
                alert("Falha na conexão com o servidor.");

                // Restaura o texto do botão em caso de erro
                if (btnLogin) btnLogin.textContent = "Criar minha conta";
            }
        });
    }
});
