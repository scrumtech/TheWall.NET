namespace TheWall.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Web.Http;

    using TheWall.Models;

    public class ColumnsController : ApiController
    {
        // GET api/columns
        public IEnumerable<Column> Get()
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var columns = ravenSession.Query<Column>();

                return columns;
            }
        }

        // GET api/columns/5
        public Column Get(int id)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var column = ravenSession.Load<Column>(id);

                return column;
            }
        }

        // POST api/columns
        public void Post([FromBody]Column value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // PUT api/columns/5
        public void Put(int id, [FromBody]Column value)
        {
            value.Id = id;
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // DELETE api/columns/5
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }
    }
}
