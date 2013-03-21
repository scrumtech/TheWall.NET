using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using TheWall.Models;

namespace TheWall.Controllers
{
    public class UsersController : ApiController
    {
        // GET api/users
        public IEnumerable<Member> Get()
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var members = ravenSession.Query<Member>();

                return members;
            }
        }

        // GET api/users/5
        public Member Get(int id)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                var member = ravenSession.Load<Member>(id);

                return member;
            }
        }

        // POST api/users
        public void Post(Member value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // PUT api/users/5
        public void Put(int id, Member value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // DELETE api/users/5
        public void Delete(int id)
        {
        }
    }
}
