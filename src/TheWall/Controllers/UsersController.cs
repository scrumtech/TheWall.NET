// --------------------------------------------------------------------------------------------------------------------
// <copyright file="UsersController.cs" company="nib healthfunds ltd.">
//   Copyright 2013
// </copyright>
// <summary>
//   Defines the UsersController type.
// </summary>
// --------------------------------------------------------------------------------------------------------------------

namespace TheWall.Controllers
{
    using System.Collections.Generic;
    using System.Web.Http;

    using TheWall.Models;

    /// <summary>
    /// The users controller.
    /// </summary>
    public class UsersController : ApiController
    {
        /// <summary>
        /// Defines REST get function accessed via 'api/users'
        /// </summary>
        /// <returns>
        /// A <see cref="IEnumerable"/> of <see cref="Member"/>.
        /// </returns>
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
        public void Post([FromBody] Member value)
        {
            using (var ravenSession = RavenDataStore.Instance.OpenSession())
            {
                ravenSession.Store(value);
                ravenSession.SaveChanges();
            }
        }

        // PUT api/users/5
        public void Put(int id, [FromBody] Member value)
        {
            value.Id = id;
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
