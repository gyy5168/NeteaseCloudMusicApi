const axios = require('axios')
const fs = require('fs-extra')

// const file = './scripts/json/data/top.json'
// axios.get('http://localhost:3000/top/artists?limit=100').then((res) => {
//   if (res.status === 200) {
//     const data = res.data.artists.map((artist) => {
//       const { name, id, picUrl } = artist
//       return { name, id, picUrl }
//     })
//     fs.writeFileSync(file, JSON.stringify(data))
//   }
// })

const initials = [
  '-1',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
]

const areas = [
  {
    area: 7,
    areaName: 'chinese',
  },
  {
    area: 96,
    areaName: 'english',
  },
  {
    area: 88,
    areaName: 'japanese',
  },
  {
    area: 16,
    areaName: 'korean',
  },
  {
    area: 0,
    areaName: 'other',
  },
]
const basePath = './scripts/data/artists/'

const artists = {}

const getArtists = (area, type, initial) => {
  return axios
    .get(
      `http://localhost:3000/artist/list?type=${type}&area=${area}&limit=100&initial=${initial}`,
    )
    .then((res) => {
      console.log(
        `http://localhost:3000/artist/list?type=${type}&area=${area}&limit=100&initial=${initial}`,
      )
      if (res.status === 200) {
        const data = res.data.artists.map((artist) => {
          const { name, id, picUrl } = artist
          return { name, id, picUrl }
        })
        return data
      }
    })
}
const types = ['', 'male', 'female', 'group']
const cacheArtists = async (area, areaName, type) => {
  const file = `${basePath}${areaName}_${types[type]}.json`
  for (let index = 0; index < initials.length; index++) {
    const initial = initials[index]
    const data = await getArtists(area, type, initial)
    artists[initial] = data
  }
  fs.writeFileSync(file, JSON.stringify(artists))
}

const getFiles = async () => {
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i]
    for (let j = 1; j < 4; j++) {
      await cacheArtists(area.area, area.areaName, j)
    }
  }
}
// getFiles()

const allArtists = []

const getJson = async (area, areaName, type) => {
  const file = `${basePath}${areaName}_${types[type]}.json`
  const data = fs.readFileSync(file, 'utf-8')
  const json = JSON.parse(data)
  for (let index = 0; index < initials.length; index++) {
    const initial = initials[index]
    const initialArtists = json[initial]
    initialArtists.forEach((item) => {
      const { name, id, picUrl } = item
      const artist = allArtists.find((aItem) => aItem.id === id)
      if (artist) {
        artist.initials.push(initial)
      } else {
        allArtists.push({
          name,
          id,
          picUrl,
          area,
          type,
          initials: [initial],
        })
      }
    })
  }
}
const joinAllArtists = async () => {
  for (let i = 0; i < areas.length; i++) {
    const area = areas[i]
    for (let j = 1; j < 4; j++) {
      await getJson(area.area, area.areaName, j)
    }
  }
  fs.writeFileSync(
    './scripts/data/artists/all.json',
    JSON.stringify(allArtists),
  )
}
joinAllArtists()

const getSongs = (id) => {
  return axios.get(`http://localhost:3000/artists?id=${id}`).then((res) => {
    if (res.status === 200) {
      const data = res.data.hotSongs
        .filter((song) => {
          return song.fee === 0 || song.fee === 8
        })
        .map((song) => {
          const { id, name, dt, ar, al } = song
          return {
            id,
            name,
            dt,
            ar: {
              id: ar[0].id,
              name: ar[0].name,
            },
            al: {
              id: al.id,
              name: al.name,
              picUrl: al.picUrl,
            },
          }
        })
      fs.writeFileSync(`./scripts/data/songs/${id}.json`, JSON.stringify(data))
    }
  })
}
const getAllSongs = async () => {
  const file = `${basePath}all.json`
  const data = fs.readFileSync(file, 'utf-8')
  const artists = JSON.parse(data)
  for (let i = 0; i < artists.length; i++) {
    const artist = artists[i]
    const { id } = artist
    await getSongs(id)
  }
}
// getAllSongs()
