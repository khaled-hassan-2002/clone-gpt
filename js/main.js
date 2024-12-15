const typing = document.querySelector('.typing')
const chatlist = document.querySelector('.chat-list')
const toggle_them = document.querySelector('#toggle_them')
const delet = document.querySelector('#delet')
let usreMessage = null
const GEMINI_API_KEY = 'AIzaSyC_H_x04IktjhAiWf4PDSwdex7cw5b4J2E'
const apiurl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`
const loadLocalStorage = () => {
    const saveChats = localStorage.getItem('saveChats')
    const islightMode = (localStorage.getItem('theme_mode') === 'light_mode')
    document.body.classList.toggle('light_mode', islightMode)
    toggle_them.innerText = islightMode ? 'dark_mode' : 'light_mode'
    chatlist.innerHTML = saveChats || ''
    document.body.classList.toggle('hide-header', saveChats)
    chatlist.scrollTo(0, chatlist.scrollHeight)
}
loadLocalStorage()
const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div')
    div.classList.add('message', ...classes)
    div.innerHTML = content
    return div
}
const showTypingEffect = (text, textElement) => {
    const words = text.split(' ')
    let index = 0
    const typingInterval = setInterval(() => {
        textElement.innerText += (index === 0 ? '' : ' ') + words[index++]
        if (index === words.length) {
            clearInterval(typingInterval)
            localStorage.setItem('saveChats', chatlist.innerHTML)
        }
        chatlist.scrollTo(0, chatlist.scrollHeight)
    }, 75)
}
const generateApiResponse = async (incomingMessageDiv) => {
    const textElement = incomingMessageDiv.querySelector(".text")
    try {
        const response = await fetch(apiurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: usreMessage }]
                }]
            })
        })
        const data = await response.json()
        const apiResponse = data?.candidates[0].content.parts[0].text
        showTypingEffect(apiResponse, textElement)
    } catch (error) {
        console.log(error)
    } finally {
        incomingMessageDiv.classList.remove('loading')
    }
}
const showloadingAnimation = () => {
    const html = `
    <div
                    class="message-content d-flex align-items-center gap-3 w-100">
                    <img src="images/gemini.svg" alt="gemini image"
                        class="avatar rounded-circle object-fit-cover">
                    <p class="text"></p>
                    <div class="loading-indicator  w-100 flex-column gap-2">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span onclick='copyMessage(this)'
                    class="copy ms-5 fs-4 d-flex align-items-center justify-content-center rounded-circle  border-0  material-symbols-rounded">content_copy</span>
    `
    const incomingMessageDiv = createMessageElement(html, "incoming", 'loading')
    chatlist.appendChild(incomingMessageDiv)
    chatlist.scrollTo(0, chatlist.scrollHeight)
    generateApiResponse(incomingMessageDiv)
}
const copyMessage = (copyIcon) => {
    const messageText = copyIcon.parentElement.querySelector('.text').innerText
    navigator.clipboard.writeText(messageText)
    copyIcon.innerText = "done"
    setTimeout(() => copyIcon.innerText = "content_copy", 1000)
}
const handleOutgoingChat = () => {
    usreMessage = typing.querySelector('#message').value.trim()
    if (!usreMessage) return
    const html = `
    <div
                    class="message-content d-flex align-items-center gap-3 w-100">
                    <img src="images/user.jpg" alt="user image"
                        class="avatar rounded-circle object-fit-cover">
                    <p class="text"></p>
                </div>
    `
    const outgoingMessageDiv = createMessageElement(html, "outgoing")
    outgoingMessageDiv.querySelector('.text').innerText = usreMessage
    chatlist.appendChild(outgoingMessageDiv)
    typing.reset()
    chatlist.scrollTo(0, chatlist.scrollHeight)
    document.body.classList.add('hide-header')
    setTimeout(showloadingAnimation, 500)
}
toggle_them.addEventListener('click', () => {
    const islightMode = document.body.classList.toggle('light_mode')
    localStorage.setItem('theme_mode', islightMode ? 'light_mode' : 'dark_mode')
    toggle_them.innerText = islightMode ? 'dark_mode' : 'light_mode'
})
delet.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete messages')) {
        localStorage.removeItem('saveChats')
        loadLocalStorage()
    }
})
typing.addEventListener('submit', (e) => {
    e.preventDefault()
    handleOutgoingChat()
})