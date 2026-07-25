# The vision for open public data

Rahul Gandhi recently held a press conference on irregularities in electoral roll data provided by the Election Commission of India. Veracity of the claims aside, the methodology of data analysis is quite interesting. He displayed thousands of pages of ECI data, which they had to digitize, collate, clean and process— all this before you can actually analyze the data. This is an apt visual illustration of how most public data in this country looks like. It's there, but you can't really do much with it unless you take the effort to collate, clean, and process the data to make it usable. I am quite familiar with this process—having built dozens of such datasets over the past five years.

Most of the public data in this country is available but not directly usable. Let's take a look at the parliament for instance—the portal is available, but in order to create a database out of it—let's say of every record for every session that the website contains—you'd need to write webscrapers, collate, validate, clean, and process the data before it's ready for analysis. This takes a lot of tech skills to manage, maintain, and implement such projects. Add to this the fact that most government websites and data sources aren't exactly reliable.

While I already do this kind of work over weekends for my personal projects, it doesn't really solve the larger problem. Most of the potential of public data is locked away. My vision for solving this problem is to have a centralized open source database, which covers all sources of public data that we can think of—maintained and updated regularly. Basically, a single API where you can query all public data reliably.

Building and maintaining such a resource would require collaboration, not just in terms of data collection and technology, but also for hosting costs and funding. If this idea interests you—whether you're a developer, researcher, or just someone passionate about open data—I'd love to connect and explore ways to work together.

---

**P.S.** The Parliament data API I mentioned is available [here](https://github.com/tushar-anand15/parliament_proceedings). This blog was inspired by that project.

**P.P.S.** Here’s a non-exhaustive list of documents and sources that such a database could include:
- All government departments—central, state, and local levels
- All ministries, executive orders, subordinate legislations, etc.
- All gazette orders
- All parliamentary data—transcriptions, questions (state level?)
- All state budget documents
- All judicial data—High Courts, Supreme Court, lower courts (ecourts)
- All tribunals
- Every public document we can think of!!

