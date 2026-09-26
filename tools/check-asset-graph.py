"""Validate a local Asset Studio JSON-LD snapshot against pinned Core + Assets SHACL.
Usage: python tools/check-asset-graph.py path/to/graph.jsonld
Install: python -m pip install -r asset-studio/standards/requirements.txt
No remote JSON-LD contexts are allowed.
"""
import json
import sys
from pathlib import Path
from rdflib import Graph
from pyshacl import validate
p=Path(__file__).resolve().parent.parent/'asset-studio/standards'
data=json.loads(Path(sys.argv[1]).read_text())
expected={'a':'urn:noppadol:assets:ontology:','b':'urn:noppadol:assets:bridge:','n':'urn:noppadol:ontology:','f':'urn:noppadol:assets:field:','xsd':'http://www.w3.org/2001/XMLSchema#'}
if data.get('@context')!=expected:raise SystemExit('Only the pinned local Asset Studio context is accepted')
def check_nested(value):
 if isinstance(value,dict):
  if '@context' in value:raise SystemExit('Nested JSON-LD contexts are not accepted')
  for v in value.values():check_nested(v)
 elif isinstance(value,list):
  for v in value:check_nested(v)
check_nested(data.get('@graph',[]))
graph=Graph().parse(data=json.dumps(data),format='json-ld');shapes=Graph()
for f in ['assets.ttl','bridge.ttl','core-ontology.ttl','concepts.ttl','fields.ttl']:graph.parse(p/f)
for f in ['shapes.ttl','core-shapes.ttl']:shapes.parse(p/f)
conforms,_,report=validate(graph,shacl_graph=shapes,inference='none',advanced=True)
print(report)
raise SystemExit(0 if conforms else 1)
