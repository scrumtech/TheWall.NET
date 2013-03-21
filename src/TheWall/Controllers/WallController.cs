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
            return View("Index");
        }

    }
}
