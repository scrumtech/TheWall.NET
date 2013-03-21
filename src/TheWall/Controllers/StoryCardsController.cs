using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using TheWall.Models;

namespace TheWall.Controllers
{
    public class StoryCardsController : ApiController
    {
        // GET api/storycards
        public IEnumerable<StoryCard> Get()
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var storyCards = ravenSession.Query<StoryCard>();

                return storyCards;
            }
        }

        // GET api/storycards/5
        public StoryCard Get(int id)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                return ravenSession.Load<StoryCard>(id);
            }
        }

        // POST api/storycards
        public void Post([FromBody]StoryCard value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // PUT api/storycards/5
        public void Put(int id, [FromBody]StoryCard value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var storyCard = ravenSession.Load<StoryCard>(id);
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // DELETE api/storycards/5
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
