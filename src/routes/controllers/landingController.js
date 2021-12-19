import { getLandingData } from "../../services/landingService.js";
import { includeSessionData} from "../../utils/utils.js";

const showLandingPage = async ({render, state}) => {
    render('index.ejs', await includeSessionData(await getLandingData(), state));
}

const showAboutPage = async ({render, state}) => {
    render('about.ejs', await includeSessionData({ }, state));
}

export { showLandingPage, showAboutPage };

/*
19.12.2021 Note this is not updated
// if would like to authenticated user's own avg moods use this below
// left here for future improvements

    if (await session.get('authenticated')) {
        const user = (await session.get('user')).id;
        render('index.ejs', await includeSessionData(await getLandingData(user), session));
    }
    else render('index.ejs', await includeSessionData({}, session));

*/