namespace TheWall.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Web;
    using System.Web.Mvc;

    using TheWall.Models;

    public class WallController : BaseController
    {
        //
        // GET: /Wall/

        public ActionResult Index()
        {
            // create a story card
            this.RavenSession.Store(
                new StoryCard()
                    {
                        Id = 1,
                        AcceptanceCriteria = "This is a story card",
                        StoryPoints = 5,
                        Title = "As a user I want to do something so that I can achieve a goal."
                    });

            // load a story card
            var storyCard = this.RavenSession.Load<StoryCard>(1);

            return View("Index");
        }

    }
}
