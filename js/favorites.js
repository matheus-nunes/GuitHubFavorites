export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint)
      .then(data => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers
      }))
  }
}

// classe que vai conter a lógica dos dados

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@githubfavorites:')) || []
  }

  save() {
    localStorage.setItem('@githubfavorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('usuário já cadastrado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('usuário não existe')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  limpainput() {
    this.root.querySelector('.Github-Search input').value = ''
  }

  delete(user) {
    // esta função é baixo é pra sempre retornar verdadeiro ou falso
    //caso seja diferente ele coloca no vetor, caso seja igual ele tira do vetor
    // e depois ele constroi todos os itens do vetor novamente
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    // agora vamos pegar o array e reatribuir novamente
    this.entries = filteredEntries
    this.update()
    this.save()
  }
}

//classe que vai criar a visualização e eventos do html
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    console.log(this.root)

    //neste momento o this.root é o #app
    //basta fazer a lógica que exportamos a classe para o main, e main estamos passando no lugar do root o #app.
    this.tbody = document.querySelector('table tbody')
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.Github-Search button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.Github-Search input')

      this.add(value)
      this.limpainput()
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`

      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositorio').textContent = user.public_repos
      row.querySelector('.seguidores').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isok = confirm('Tem certeza que deseja excluir este item?')
        if (isok) {
          this.delete(user)
        }
      }
      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    const content = ` <td class="user">
    <img
      src="https://github.com/matheus-nunes.png"
      alt="foto de matheus nunes"
    />
    <a href="https://github.com/matheus-nunes" target="_blank">
      <p>Matheus Nunes</p>
      <span>matheusnunes</span>
    </a>
  </td>
  <td class="repositorio">15</td>
  <td class="seguidores">5</td>
  <td><button class="remove">Remover</button></td>
`

    tr.innerHTML = content

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}

document.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    var btn = document.querySelector('#submit')

    btn.click()
  }
})

// como os dados serão estruturados
