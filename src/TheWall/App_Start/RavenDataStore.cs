namespace TheWall
{
    using System;
    using System.Reflection;

    using Raven.Client;
    using Raven.Client.Embedded;
    using Raven.Client.Indexes;

    public class RavenDataStore
    {
        private static IDocumentStore instance;

        public static IDocumentStore Instance
        {
            get
            {
                if (instance == null)
                    throw new InvalidOperationException(
                      "IDocumentStore has not been initialized.");
                return instance;
            }
        }

        public static IDocumentStore Initialize()
        {
            // setup ravenDB
            instance = new EmbeddableDocumentStore() 
            { 
                ConnectionStringName = "RavenDB"
            };

            // instance.Conventions.IdentityPartsSeparator = "-";
            instance.Initialize();

            IndexCreation.CreateIndexes(Assembly.GetCallingAssembly(), instance);
            return instance;
        }
    }
}