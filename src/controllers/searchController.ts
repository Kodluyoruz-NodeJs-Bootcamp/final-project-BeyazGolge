import { Request, Response } from 'express';
import axios from 'axios';
enum Methods {
  Get = 'GET',
}

export async function searchFilm(req: Request, res: Response) {
  const queryString = req.body.filmSearchQuery;
  const options = {
    method: Methods.Get,
    url: 'https://imdb8.p.rapidapi.com/title/find',
    params: { q: queryString },
    headers: {
      'x-rapidapi-host': 'imdb8.p.rapidapi.com',
      'x-rapidapi-key': '7513cb2285mshb19348aa76dba2cp11be8bjsn70cf26e8521f',
    },
  };

  try {
    const incomingList = await (await axios.request(options)).data.results;
    const listOfFilms: object[] = [];
    for (const item of incomingList) {
      if (item.title) {
        listOfFilms.push({
          id: item.id,
          image: item.image.url,
          title: item.title,
        });
      }
    }

    res.status(200).render('searchFilmResults', { listOfFilms });
  } catch (error) {
    req.flash('error', 'An error occured with the imdb api');
    res.status(400).redirect('/');
  }
}

export async function searchActor(req: Request, res: Response) {
  const idToSearch = await req.body.actorSearchQuery.replace(/\s/g, '%20');
  const getIDs = {
    method: Methods.Get,
    url: `https://data-imdb1.p.rapidapi.com/actor/imdb_id_byName/${idToSearch}/`,
    headers: {
      'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
      'x-rapidapi-key': '7513cb2285mshb19348aa76dba2cp11be8bjsn70cf26e8521f',
    },
  };
  try {
    const incomingActorIDList = await (
      await axios.request(getIDs)
    ).data.results;
    const actorIDs = await incomingActorIDList.slice(0, 10);
    const actorInfos = [];
    for (const actor of actorIDs) {
      const getActorInfo = {
        method: Methods.Get,
        url: `https://data-imdb1.p.rapidapi.com/actor/id/${actor.imdb_id}/`,
        headers: {
          'x-rapidapi-host': 'data-imdb1.p.rapidapi.com',
          'x-rapidapi-key':
            '7513cb2285mshb19348aa76dba2cp11be8bjsn70cf26e8521f',
        },
      };

      const incomingActorInfo = await (
        await axios.request(getActorInfo)
      ).data.results;
      actorInfos.push({
        name: incomingActorInfo.name,
        image: incomingActorInfo.image_url,
      });
    }
    res.status(200).render('searchActorResults', { actorInfos });
  } catch (error) {
    req.flash('error', 'An error occured with the imdb api');
    res.status(400).redirect('/');
  }
}
