const gotoRegister = () => {
    const loginForm = document.getElementById('login-form')
    const registerForm = document.getElementById('register-form')

    loginForm.style.display = 'none'
    registerForm.style.display = 'flex'
}

const gotoLogin = () => {
    const loginForm = document.getElementById('login-form')
    const registerForm = document.getElementById('register-form')

    loginForm.style.display = 'flex'
    registerForm.style.display = 'none'
}


const nextStep = () => {
    const step1 = document.getElementById('register-form-step1')
    const step2 = document.getElementById('register-form-step2')

    step1.style.display = 'none'
    step2.style.display = 'flex'
}

const backStep = () => {
    const step1 = document.getElementById('register-form-step1')
    const step2 = document.getElementById('register-form-step2')

    step1.style.display = 'flex'
    step2.style.display = 'none'
}

const visitRegisterPage = () => {
    const mainLogin = document.getElementById('main-login')
    const registerPage = document.getElementById('create-account-page')

    mainLogin.style.display = 'none'
    registerPage.style.display = 'flex'
}

const gotoMainPage = () => {
    const mainLogin = document.getElementById('main-login')
    const registerPage = document.getElementById('create-account-page')

    mainLogin.style.display = 'flex'
    registerPage.style.display = 'none'
}

