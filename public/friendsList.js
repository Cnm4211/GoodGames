document.getElementById('hamburger').addEventListener('click', function () {
    const panel = document.getElementById('sideMenuPanel');
    panel.classList.toggle('open');
});

document.getElementById('sideMenuHamburger').addEventListener('click', function () {
    const panel = document.getElementById('sideMenuPanel');
    panel.classList.remove('open');
});

function isTokenValid(token) {
    if (!token) return false;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    }
    catch (e) {
        return false;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const myListButton = document.getElementById('myListButton');
    const signInButton = document.getElementById('signInButton');
    const signUpButton = document.getElementById('signUpButton');
    const sideMenuMyList = document.getElementById('myListItem');
    const logoutButton = document.getElementById('logoutButton');
    if (isTokenValid(token)) {
        myListButton.style.display = 'block';
        signInButton.style.display = 'none';
        signUpButton.style.display = 'none';
        sideMenuMyList.style.display = 'block';
        logoutButton.style.display = 'block';
    }
    else {
        myListButton.style.display = 'none';
        signInButton.style.display = 'block';
        signUpButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }
})

async function acceptFriendRequest(friendId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/friends/accept/${friendId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message);
}

window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!isTokenValid(token)) {
                alert('Please sign in to add to your list');
                return;
            }
    const res = await fetch(`/friends/pending`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const data = await res.json();
    console.log(data);

    
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    data.results.forEach(user => {
        console.log("test");
        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';

        /*const img = document.createElement('img');
        img.src = game.background_image || 'https://via.placeholder.com/100';
        img.alt = game.name;
        img.style.maxWidth = '100px';
        img.style.maxHeight = '100px';
        */
        const textDiv = document.createElement('div');
        const p = document.createElement('p');
        p.textContent = `${user.username}`;
        textDiv.appendChild(p);

        const plus = document.createElement('button');
        plus.textContent = 'Accept Request';
        plus.addEventListener('click', async () => {
            acceptFriendRequest(user.id);
        });

        //itemDiv.appendChild(img);
        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(plus);
        resultsDiv.appendChild(itemDiv);
    });



});