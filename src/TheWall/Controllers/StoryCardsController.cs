// --------------------------------------------------------------------------------------------------------------------
// <copyright file="StoryCardsController.cs" company="nib healthfunds ltd.">
//   Copyright 2013
// </copyright>
// <summary>
//   Defines the StoryCardsController type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace TheWall.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Web.Http;

    using TheWall.Hubs;
    using TheWall.Models;

    /// <summary>
    /// The story cards controller.
    /// </summary>
    public class StoryCardsController : ApiController
    {
        // GET api/storycards

        /// <summary>
        /// The get. 
        /// </summary>
        /// <returns>
        /// The <see cref="IEnumerable"/>.
        /// </returns>
        public IEnumerable<StoryCard> Get()
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var storyCards = ravenSession.Query<StoryCard>();

                return storyCards;
            }
        }

        // GET api/storycards/5

        /// <summary>
        /// Get by Id
        /// </summary>
        /// <param name="id">The Story card id to retrieve.</param>
        /// <returns>A <see cref="StoryCard"/></returns>
        public StoryCard Get(int id)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                return ravenSession.Load<StoryCard>(id);
            }
        }

        // POST api/storycards

        /// <summary>
        /// The post.
        /// </summary>
        /// <param name="value">
        /// The value.
        /// </param>
        public void Post([FromBody]StoryCard value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }

            var storyBoardHub = new StoryCardHub();
            storyBoardHub.Send("new", value);
        }

        // PUT api/storycards/5

        /// <summary>
        /// The put.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <param name="value">
        /// The value.
        /// </param>
        public void Put(int id, [FromBody]StoryCard value)
        {
            value.Id = id;
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }

            var storyBoardHub = new StoryCardHub();
            storyBoardHub.Send("update", value);
        }

        // DELETE api/storycards/5

        /// <summary>
        /// The delete.
        /// </summary>
        /// <param name="id">
        /// The id.
        /// </param>
        /// <exception cref="NotImplementedException">
        /// Not yet implemented.
        /// </exception>
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
