// Authentication Module
window.AuthModule = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        $('#loginFormElement').on('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },

    handleLogin() {
        const email = $('#email').val();
        const senha = $('#senha').val();

        if (!email || !senha) {
            this.showError('Por favor, preencha todos os campos');
            return;
        }

        this.setLoading(true);
        this.hideError();

        $.post('api/auth.php?action=login', {
            email: email,
            senha: senha
        })
        .done((response) => {
            if (response.success) {
                window.app.currentUser = response.user;
                window.app.showMainApp();
                window.app.updateUserInfo();
                window.app.navigateTo('dashboard');
            } else {
                this.showError(response.message || 'Erro ao fazer login');
            }
        })
        .fail((xhr) => {
            let message = 'Erro ao conectar com o servidor';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                message = xhr.responseJSON.message;
            }
            this.showError(message);
        })
        .always(() => {
            this.setLoading(false);
        });
    },

    setLoading(loading) {
        const button = $('#loginButton');
        if (loading) {
            button.prop('disabled', true).html(`
                <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                Entrando...
            `);
        } else {
            button.prop('disabled', false).text('Entrar');
        }
    },

    showError(message) {
        $('#loginErrorMessage').text(message);
        $('#loginError').removeClass('hidden');
    },

    hideError() {
        $('#loginError').addClass('hidden');
    }
};

// Initialize when document is ready
$(document).ready(() => {
    window.AuthModule.init();
});