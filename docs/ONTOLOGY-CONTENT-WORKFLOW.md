# Woodworking / Records — public content release 1.1.0

Reader routes: `/woodworking/`, `/records/`, `/knowledge/`, `/ontology/` and `/notes/`.
The website contains concept definitions, navigation relations, a domain class model
and editorial articles. It contains **zero personal asset records**.

## Six-stage contract

| Stage | Public deliverable | Source version |
|---|---|---|
| Controlled vocabulary | Stable URNs, Thai display labels, English graph labels and operational definitions | Core/Assets CV 1.2.0 |
| Metadata schema | Field types, scope and unknown/identifier policy | Assets profile 1.4.0 |
| Taxonomy | Explicit narrower/broader concept navigation, distinct from component relations | 1.1.0 |
| Thesaurus | Alternative labels and symmetric related concepts | 1.1.0 |
| Ontology | Separate source record, physical item, product model, musical work, sound recording and release edition | Assets ontology 1.1.0 |
| Knowledge graph | Public concepts and article links in `/knowledge-graph.jsonld` | Public projection 1.1.0 |

Downloadable artifacts are under `/ontology/domains/`. Stable private concept URNs
are retained; `schema:url` points to the reader page. Concept-to-class alignment is
explicit `rdfs:seeAlso`, not an automatic equivalence or retyping of SKOS concepts.
Definitions remain editorial operational definitions, with review status shown on
reader pages. Validation checks structure and constraints, not physical truth.

## Editing and publication

The private workbench runs on the owner's computer, outside this repository.
It reads revision-pinned Processed Assets and allows source selection, concept
selection, content editing and stages idea → draft → review → ready → published.
Content is saved to files with revision conflict detection and an audit log.

The public export selects only content that is explicitly public and ready or
already published. It copies only title, subtitle, body, domain, concepts and date;
source UUIDs, raw text, evidence, asset records, purchase information and source
links stay in private storage. This repository consumes the generated files
`src/_data/semantic.json` and `src/_data/editorial.json`.

`npm run build` builds reader pages and the public knowledge graph. Run
`npm run test:domains` after building, and `npm run test:gallery` when changing the
image integration. GitHub checks both before a release is merged. The deploy
workflow publishes `_site`; never deploy a private preview or workbench folder.

The existing Gallery is retained. Its public catalog may be empty; private images
are not implicitly published as part of the ontology release. The earlier website
article and standalone tools are preserved.

## Limits

- Source records do not establish physical item identity or ownership.
- Discogs candidates remain private proposals; no match is approved by the build.
- Missing maintenance data means no recorded data in this batch.
- Scrivener originals are preserved; there is no automatic two-way synchronization.
- This is the first operational release for the current tool/record corpus, not a
  claim to exhaust every topic in woodworking or music.

Technical references: [SKOS](https://www.w3.org/TR/skos-reference/),
[SHACL](https://www.w3.org/TR/shacl/), and the project's adopted
[Ontology Pipeline](https://jesstalisman-ia.github.io/ontology-pipeline/).

## Build dependency audit (5 October 2026)

A fresh lockfile installation reported a new `markdown-it` advisory; the direct
dependency is updated to 14.3.1. `braces` 3.0.3 remains the latest registry release
and has an unpatched recursion advisory propagated through Eleventy/chokidar.
It belongs to the local build/watch toolchain, not a server deployed with this
static site. Do not apply npm's suggested downgrade to Eleventy 0.6.0. The
workbench binds to loopback and does not accept glob patterns or templates.
Track the upstream fix; this release does not claim a clean dependency audit.
