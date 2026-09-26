"""Reproducible RDF, SHACL, query and inference regression checks. No live data import."""
from pathlib import Path
import json,hashlib
from rdflib import Graph,Namespace,RDF,Literal,XSD
from pyshacl import validate
from owlrl import DeductiveClosure, OWLRL_Semantics
P=Path(__file__).resolve().parent
A=Namespace('urn:noppadol:assets:ontology:');B=Namespace('urn:noppadol:assets:bridge:');N=Namespace('urn:noppadol:ontology:');E=Namespace('urn:noppadol:assets:fixture:')
base=Graph(); shapes=Graph(); results=[]
for f in ['assets.ttl','bridge.ttl','core-ontology.ttl','concepts.ttl','fields.ttl','examples.ttl']:base.parse(P/f,format='turtle')
for f in ['shapes.ttl','core-shapes.ttl']:shapes.parse(P/f,format='turtle')
def check(name,ok):results.append({'check':name,'passed':bool(ok)})
def conforms(g):
 ok,report,txt=validate(g,shacl_graph=shapes,inference='none',advanced=True)
 return ok,txt
ok,txt=conforms(base);check('Combined Core + Assets fixture conforms',ok)
if not ok: print(txt)
def negative(name,remove=(),add=()):
 g=Graph()
 for t in base:g.add(t)
 for t in remove:g.remove(t)
 for t in add:g.add(t)
 ok,_=conforms(g);check(name,not ok)
negative('Known value without source rejected',[(E.width,A.sourceInput,None)])
negative('Known value without basis rejected',[(E.width,A.basis,None)])
negative('Unknown carrying numeric value rejected',add=[(E['unknown-steel'],A.numberValue,Literal('50',datatype=XSD.decimal)),(E['unknown-steel'],A.unit,Literal('mm'))])
negative('Number without unit rejected',[(E.width,A.unit,None)])
negative('Multiple value kinds rejected',add=[(E.width,A.textValue,Literal('50'))])
negative('Unregistered field rejected',[(E.width,A.field,None)],[(E.width,A.field,E.fake)])
negative('Model cannot point to physical item',[(E.plane,A.model,None)],[(E.plane,A.model,E.camera)])
negative('Physical item cannot be digital source revision',add=[(E.plane,RDF.type,N.SourceRevision)])
negative('Edition cannot also be release group',add=[(E.edition,RDF.type,A.ReleaseGroup)])
negative('Creative proposal cannot use supports evidence',[(E.inspiration,B.evidenceLink,None)],[(E.inspiration,B.evidenceLink,E.support)])
negative('Supported assertion needs supports evidence',[(E.component,B.evidenceLink,None)],[(E.component,B.evidenceLink,E.context)])
negative('Component relation rejects self relation',[(E.component,B.subject,None)],[(E.component,B.subject,E.blade)])
negative('Inspiration endpoint must be WorkInProgress',[(E.inspiration,B.object,None)],[(E.inspiration,B.object,E.camera)])
negative('Inspiration cannot be promoted to source supported',[(E.inspiration,N.relationKind,None)],[(E.inspiration,N.relationKind,Literal('source_supported'))])
negative('Pilot asset audience cannot be public',[(E.plane,N.audience,None)],[(E.plane,N.audience,Literal('public'))])
negative('Legacy reviewed status not silently accepted',[(E.plane,N.reviewStatus,None)],[(E.plane,N.reviewStatus,Literal('reviewed'))])
negative('Review approval requires audit',[(E.plane,N.reviewStatus,None)],[(E.plane,N.reviewStatus,Literal('approved'))])
negative('Core predicate whitelist still enforced',add=[(E.inspiration,RDF.type,N.Connection),(E.inspiration,N.subject,E.plane),(E.inspiration,N.object,E.work),(E.inspiration,N.predicate,B.inspiresWork),(E.inspiration,N.evidenceLink,E.context)])
negative('Description must reference its own source',[(E.description,B.subject,None)],[(E.description,B.subject,E.other),(E.other,RDF.type,N.KnowledgeInput),(E.other,N.hasRevision,E.revision),(E.other,N.title,Literal('other')),(E.other,N.audience,Literal('owner')),(E.other,N.publication,Literal('draft')),(E.other,N.reviewStatus,Literal('unreviewed')),(E.other,N.rightsStatus,Literal('unknown')),(E.other,N.createdBy,Literal('fixture')),(E.other,N.createdAt,Literal('2026-09-26T00:00:00+07:00',datatype=XSD.dateTime))])
check('Fixture snapshot hash matches',str(base.value(E.revision,N.sha256))==hashlib.sha256((P/'fixture-source.txt').read_bytes()).hexdigest())
qdir=P/'queries'; query_results={}
for f in sorted(qdir.glob('*.rq')):
 rows=list(base.query(f.read_text()));query_results[f.name]=[[str(x) for x in r] for r in rows];check('Competency query '+f.name,len(rows)>0)
closure=Graph()
for t in base:closure.add(t)
DeductiveClosure(OWLRL_Semantics).expand(closure)
check('OWL inference does not turn bridge into Core Connection',(E.inspiration,RDF.type,N.Connection) not in closure)
check('OWL inference does not turn physical item into media file',(E.plane,RDF.type,N.MediaAsset) not in closure)
check('Creative proposal does not assert a direct fact',(E.plane,B.inspiresWork,E.work) not in closure)
report={'allPassed':all(r['passed'] for r in results),'checks':results,'count':len(results),'dataTriples':len(base),'shapeTriples':len(shapes),'inference':'none for validation; separate OWL RL regression','queryResults':query_results,'scope':'Synthetic fixture, not user inventory. Schema validation does not establish factual truth.'}
(P/'validation-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'allPassed':report['allPassed'],'checks':len(results),'failed':[r for r in results if not r['passed']]},indent=2))
raise SystemExit(0 if report['allPassed'] else 1)
