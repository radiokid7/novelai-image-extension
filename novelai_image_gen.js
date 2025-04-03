(function () {
  const EXTENSION_NAME = 'novelai_image_gen';

  function registerExtension() {
    const ext = {
      name: EXTENSION_NAME,
      setup() {
        addNovelAIButton();
      },
    };
    window.SillyTavernExtensionRegistry.register(ext);
  }

  async function addNovelAIButton() {
    const btn = document.createElement('button');
    btn.innerText = '🖼️ Generate Image';
    btn.style.marginLeft = '5px';
    btn.onclick = async () => {
      const messages = getLastChatMessages(6);
      const payload = {
        messages: messages.map((msg) => ({
          sender: msg.name || msg.author || 'Narrator',
          text: msg.text,
        })),
      };

      try {
        const res = await fetch('http://localhost:6969/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.image) {
          const imgElement = document.createElement('img');
          imgElement.src = 'data:image/png;base64,' + data.image;
          imgElement.style.maxWidth = '300px';
          imgElement.style.borderRadius = '10px';
          imgElement.style.marginTop = '10px';
          const chat = document.getElementById('chat');
          chat.appendChild(imgElement);
        }
        if (data.prompt) {
          window.add_message('System', `🧠 Prompt used: \"${data.prompt}\"`, false);
        }
      } catch (err) {
        window.add_message('System', '❌ Error contacting NovelAI image server.', false);
        console.error(err);
      }
    };

    const controls = document.querySelector('.menu_toggle');
    if (controls) controls.parentNode.appendChild(btn);
  }

  function getLastChatMessages(n) {
    const msgs = window.chat.map(m => ({ name: m.name, text: m.mes }));
    return msgs.slice(-n);
  }

  registerExtension();
})();
