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
    loadCurrentFriends();
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

document.getElementById('logoutButton').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'Home.html';
});

async function acceptFriendRequest(friendId) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/friends/accept/${friendId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message);
    loadPendingRequests();
}

async function removeFriend(friendId) {
    const result = confirm("Are you sure you want to remove this friend?");
    if (!result) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`/friends/remove/${friendId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    alert(data.message);
    loadCurrentFriends();
}

async function loadPendingRequests() {
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


    const resultsDiv = document.getElementById('pendingResults');
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
        plus.className = 'tab-button';
        plus.addEventListener('click', async () => {
            acceptFriendRequest(user.id);
        });

        //itemDiv.appendChild(img);
        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(plus);
        resultsDiv.appendChild(itemDiv);
    });
}

async function loadCurrentFriends() {
    const token = localStorage.getItem('token');
    if (!isTokenValid(token)) {
        alert('Please sign in to view your friends');
        return;
    }

    const res = await fetch(`/friends`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await res.json();
    console.log(data);

    const resultsDiv = document.getElementById('currentResults');
    resultsDiv.innerHTML = '';

    if (!data.results || data.results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    data.results.forEach(user => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'result-item';

        // clickable username that links to profile
        const textDiv = document.createElement('div');
        const link = document.createElement('a');
        link.href = `profile.html?id=${user.id}`;
        link.textContent = user.username;
        link.className = 'friend-link'; // optional CSS class
        textDiv.appendChild(link);

        // remove friend button
        const removeFriendButton = document.createElement('button');
        removeFriendButton.className = 'tab-button';
        removeFriendButton.textContent = 'Remove Friend';

        removeFriendButton.addEventListener('mouseenter', () => {
            removeFriendButton.classList.add('active');
        });
        removeFriendButton.addEventListener('mouseleave', () => {
            removeFriendButton.classList.remove('active');
        });

        removeFriendButton.addEventListener('click', async () => {
            removeFriend(user.id);
        });

        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(removeFriendButton);
        resultsDiv.appendChild(itemDiv);
    });
}

// Tab switching logic
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        // Remove active from all buttons & contents
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));

        // Add active to clicked tab and its content
        button.classList.add("active");
        document.getElementById(button.dataset.tab).classList.add("active");

        // Load pending requests when the pending tab is clicked
        if (button.dataset.tab === 'pendingRequests') {
            loadPendingRequests();
        }
        if (button.dataset.tab === 'currentFriends') {
            loadCurrentFriends();
        }
    });
});