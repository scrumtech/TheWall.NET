using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using TheWall.Models;

namespace TheWall.Controllers
{
    public class StoryCardController : ApiController
    {
        // GET api/storycard
        public IEnumerable<StoryCard> Get()
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var storyCards = ravenSession.Query<StoryCard>();

                return storyCards;
            }
        }

        // GET api/storycard/5
        public StoryCard Get(int id)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                return ravenSession.Load<StoryCard>(id);
            }
        }

        // POST api/storycard
        public void Post([FromBody]StoryCard value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // PUT api/storycard/5
        public void Put(int id, [FromBody]string value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // DELETE api/storycard/5
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
