
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
      const user = await response.json();

      profileName.textContent = user.user.username;

      document.getElementById('username').innerHTML = `<strong>Username:</strong> ${user.user.username}`;
      document.getElementById('memberSince').innerHTML = `<strong>Member Since:</strong> ${new Date(user.user.created_at).toLocaleDateString()}`;
      if (user.user.games_played !== undefined) {
        document.getElementById('gamesPlayed').innerHTML = `<strong>Games Played:</strong> ${user.user.games_played}`;
      }
      if (user.user.favorite_genre !== undefined) {
        document.getElementById('favoriteGenre').innerHTML = `<strong>Favorite Genre:</strong> ${user.user.favorite_genre}`;
      }
    }
    catch(err){
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
