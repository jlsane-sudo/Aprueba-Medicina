from pathlib import Path
p=Path('app.html')
s=p.read_text(encoding='utf-8')
repls=[
("const HICS_MANUAL_FILE='hics-manual.pdf';", "const HICS_MANUAL_FILE='hics-manual.pdf';\nconst FISIOLOGIA_MANUAL_FILE='fisiologia-manual.pdf';"),
("const allowedMaterialFiles=[ANATOMIA_MANUAL_FILE,'bioquimica-manual.pdf','epidemiologia.pdf','genetica.pdf',HICS_MANUAL_FILE,...Array.from({length:60},(_,i)=>`epi-tema-${String(i+1).padStart(2,'0')}.pdf`)];", "const allowedMaterialFiles=[ANATOMIA_MANUAL_FILE,'bioquimica-manual.pdf','epidemiologia.pdf','genetica.pdf',HICS_MANUAL_FILE,FISIOLOGIA_MANUAL_FILE,...Array.from({length:60},(_,i)=>`epi-tema-${String(i+1).padStart(2,'0')}.pdf`)];"),
("${[ANATOMIA_MANUAL_FILE,BCH_MANUAL_FILE,'epidemiologia.pdf','genetica.pdf',HICS_MANUAL_FILE].map", "${[ANATOMIA_MANUAL_FILE,BCH_MANUAL_FILE,'epidemiologia.pdf','genetica.pdf',HICS_MANUAL_FILE,FISIOLOGIA_MANUAL_FILE].map"),
("Versión 1.0.35", "Versión 1.0.36")
]
for old,new in repls:
    if old not in s:
        raise SystemExit(f'No se encontró patrón: {old[:100]}')
    s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
print('app.html actualizado para aceptar fisiologia-manual.pdf desde Administración')
