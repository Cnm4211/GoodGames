
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

window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const myListButton = document.getElementById('myListButton');
  const signInButton = document.getElementById('signInButton');
  const signUpButton = document.getElementById('signUpButton');
  const sideMenuMyList = document.getElementById('myListItem');
  const logoutButton = document.getElementById('logoutButton');
  const profileName = document.getElementById('profileName');
  console.log(JSON.parse(atob(token.split('.')[1])));
  if (isTokenValid(token)) {
    myListButton.style.display = 'block';
    signInButton.style.display = 'none';
    signUpButton.style.display = 'none';
    sideMenuMyList.style.display = 'block';
    logoutButton.style.display = 'block';
    try {
      const response = await fetch('/profile/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const response2 = await fetch('/profile/mygames', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response2.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const response3 = await fetch('/profile/favoriteGenre', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response3.ok) {
        throw new Error('Failed to fetch profile data');
      }
      const user = await response.json();
      const mygames = await response2.json();
      const favoriteGenre = await response3.json();
      console.log(favoriteGenre);
      profileName.textContent = user.user.username;

      document.getElementById('username').innerHTML = `<strong>Username:</strong> ${user.user.username}`;
      document.getElementById('memberSince').innerHTML = `<strong>Member Since:</strong> ${new Date(user.user.created_at).toLocaleDateString()}`;
      if (mygames.gameCount !== undefined) {
        document.getElementById('gamesPlayed').innerHTML = `<strong>Games Played:</strong> ${mygames.gameCount['Count(*)']}`;
      }
      if (favoriteGenre.favoriteGenre !== undefined) {
        document.getElementById('favoriteGenre').innerHTML = `<strong>Favorite Genre:</strong> ${favoriteGenre.favoriteGenre.genre}`;
      }
    }
    catch (err) {
      console.error(err);
    }
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


async function getTopTen() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to view your list.');
    return;
  }

  try {
    const res = await fetch('/profile/topTen', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
      }
    });

    const result = await res.json();
    console.log("Top Ten Result:", result); // Debugging line
    const tableBody = document.getElementById('tableBody');

    if (res.ok) {
      renderTable(result);
    }
    else {
      tableBody.innerHTML = 'Failed to load your list.';
    }
  }
  catch (err) {
    console.error(err);
    alert('An error occurred while fetching your list.');
  }
}

function renderTable(games) {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  if (!games || games.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="8">Your list is empty.</td></tr>';
    return;
  }
  games.forEach(game => {
    const row = document.createElement('tr');

    const numberCell = document.createElement('td');
    numberCell.textContent = game.position;
    row.appendChild(numberCell);

    // Title
    const titleCell = document.createElement('td');
    titleCell.textContent = game.game_name || '';
    row.appendChild(titleCell);

    //Score
    const scoreCell = document.createElement('td');
    scoreCell.textContent = game.score; //placeholder until i figure it out
    row.appendChild(scoreCell);


    tableBody.appendChild(row);
  });
}
getTopTen();