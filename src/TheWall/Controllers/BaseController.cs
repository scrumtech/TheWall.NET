namespace TheWall.Controllers
{
    using Raven.Client;
    using System.Web.Mvc;

    public class BaseController : Controller
    {
        public static IDocumentStore DocumentStore
        {
            get { return RavenDataStore.Instance; }
        }

        public IDocumentSession RavenSession { get; protected set; }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            RavenSession = RavenDataStore.Instance.OpenSession();
            base.OnActionExecuting(filterContext);
        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            using (RavenSession)
            {
                if (filterContext.Exception != null)
                    return;

                if (RavenSession != null)
                    RavenSession.SaveChanges();
            }

            base.OnActionExecuted(filterContext);
        }
    }
}