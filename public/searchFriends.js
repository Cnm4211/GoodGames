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

document.getElementById('searchBar').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('searchButton').click();
    }
})


document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchBar').value;
    const token = localStorage.getItem('token');
    if (!isTokenValid(token)) {
                alert('Please sign in to add to your list');
                return;
            }
    const res = await fetch(`/friends/users/search?username=${encodeURIComponent(query)}`, {
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
        plus.textContent = 'Add Friend';
        plus.addEventListener('click', async () => {
            try {
                const res = await fetch(`/friends/add/${user.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await res.json();
                if (res.ok) {
                    alert('Friend request sent');
                }
            }
            catch (err) {
                console.error(err);
                alert('Failed to send friend request');
            }
        });

        //itemDiv.appendChild(img);
        itemDiv.appendChild(textDiv);
        itemDiv.appendChild(plus);
        resultsDiv.appendChild(itemDiv);
    });



});