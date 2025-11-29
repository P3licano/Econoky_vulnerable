'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, CheckCircle2, AlertCircle, TrendingUp, Brain, Heart, TrendingDown, DollarSign, Target, Shield, CheckCircle } from 'lucide-react'

interface RespuestaParte1 {
  factor: number
  respuestas: number[] // 3 respuestas por factor
}

interface RespuestaParte2 {
  caso: number
  opcion: string // a, b, c, d, e
}

interface RespuestaParte3 {
  frase: number
  valor: number // 1-5
}

function EsmeraldaTest() {
  const [parteActual, setParteActual] = useState<'intro' | 'parte1' | 'parte2' | 'parte3' | 'resultados'>('intro')
  const [respuestasParte1, setRespuestasParte1] = useState<RespuestaParte1[]>([])
  const [respuestasParte2, setRespuestasParte2] = useState<RespuestaParte2[]>([])
  const [respuestasParte3, setRespuestasParte3] = useState<RespuestaParte3[]>([])
  const [factorActual, setFactorActual] = useState(0)
  const [preguntaActualFactor, setPreguntaActualFactor] = useState(0)
  const [resultados, setResultados] = useState<any>(null)

  const factoresParte1 = [
    {
      id: 1,
      nombre: 'Autodeterminación financiera',
      preguntas: [
        'Decido cómo y cuándo usar mi dinero sin depender de la opinión de los demás.',
        'Me siento protagonista de mis resultados económicos.',
        'Si algo sale mal en mis finanzas, asumo la responsabilidad.'
      ]
    },
    {
      id: 2,
      nombre: 'Tolerancia al riesgo e incertidumbre',
      preguntas: [
        'Me paralizo ante decisiones que implican un resultado incierto.',
        'Prefiero una mínima ganancia segura antes que una ganancia potencial con riesgo.',
        'Me siento cómodo/a tomando decisiones económicas sin saber el 100% de los detalles.'
      ]
    },
    {
      id: 3,
      nombre: 'Preferencia temporal',
      preguntas: [
        'Es más importante para mí disfrutar hoy que preocuparme por el futuro.',
        'Me cuesta ahorrar para objetivos lejanos.',
        'Valoro más una pequeña gratificación inmediata que un gran beneficio en el futuro.'
      ]
    },
    {
      id: 4,
      nombre: 'Presión social/emocional',
      preguntas: [
        'Tomo decisiones económicas influido/a por lo que hacen o dicen los demás.',
        'Gasto para sentirme parte de mi entorno o evitar el juicio ajeno.',
        'He comprado cosas solo para aparentar estabilidad o éxito.'
      ]
    },
    {
      id: 5,
      nombre: 'Planificación y toma de decisiones',
      preguntas: [
        'Reviso y ajusto regularmente mis objetivos financieros.',
        'Tengo claro cuánto necesito para alcanzar mis metas.',
        'Me cuesta organizar mi economía aunque lo intente.'
      ]
    },
    {
      id: 6,
      nombre: 'Relación emocional con el dinero',
      preguntas: [
        'El dinero me genera emociones intensas como culpa, miedo o enfado.',
        'Evito mirar mis cuentas cuando tengo ansiedad.',
        'Gasto para calmar mis emociones negativas aunque luego me arrepienta.'
      ]
    },
    {
      id: 7,
      nombre: 'Alfabetización financiera práctica',
      preguntas: [
        'Entiendo conceptos como rentabilidad, interés compuesto o inflación.',
        'Sé comparar productos financieros y detectar costes ocultos.',
        'Me cuesta entender los términos cuando hablo con mi banco o asesor.'
      ]
    },
    {
      id: 8,
      nombre: 'Uso del crédito y gestión del endeudamiento',
      preguntas: [
        'Tengo deudas que controlo, reviso y planifico.',
        'He pedido crédito sin tener claro cómo lo voy a pagar.',
        'Pago intereses por compras que ya ni recuerdo.'
      ]
    },
    {
      id: 9,
      nombre: 'Aversión al cambio / inacción',
      preguntas: [
        'Sé que tengo que hacer cambios en mi economía, pero los pospongo.',
        'Me resisto a probar nuevas formas de gestionar mi dinero.',
        'Aunque algo no funciona, sigo actuando igual por miedo a equivocarme.'
      ]
    },
    {
      id: 10,
      nombre: 'Capacidad de generar, conservar y multiplicar patrimonio',
      preguntas: [
        'Sé cómo poner mi dinero a trabajar para mí.',
        'Mis decisiones financieras me han permitido construir patrimonio.',
        'Tengo ingresos suficientes, pero no logro que mi dinero crezca ni se conserve.'
      ]
    }
  ]

  const casosParte2 = [
    {
      id: 1,
      pregunta: 'Recibes 3.000 € inesperados. ¿Qué haces?',
      opciones: {
        a: 'Me doy un capricho pendiente.',
        b: 'Los guardo sin tocar, por si acaso.',
        c: 'Pido consejo porque no sé cómo usarlo.',
        d: 'Invierto una parte y ahorro otra.',
        e: 'Pago deudas pendientes aunque no me lo pidan aún.'
      }
    },
    {
      id: 2,
      pregunta: 'Tu círculo cercano comienza a invertir. ¿Cómo reaccionas?',
      opciones: {
        a: 'Me siento presionado y actúo sin saber mucho.',
        b: 'Me intereso, pero lo dejo pasar por miedo.',
        c: 'Me formo primero y luego decido.',
        d: 'Confío en lo que hacen los demás y copio.',
        e: 'No me interesa, prefiero mi estabilidad actual.'
      }
    },
    {
      id: 3,
      pregunta: 'Has terminado de pagar un préstamo importante y tienes más liquidez mensual. ¿Qué haces?',
      opciones: {
        a: 'Aumento mis gastos fijos y me doy más libertad de consumo.',
        b: 'No cambio nada, prefiero mantener el mismo nivel de vida.',
        c: 'Reviso mis finanzas y creo un nuevo plan de ahorro o inversión.',
        d: 'Guardo el dinero sin tocarlo, por si hay algún imprevisto.',
        e: 'Lo comparto con alguien cercano que lo necesita.'
      }
    },
    {
      id: 4,
      pregunta: 'En una tienda ves algo que deseas mucho pero no necesitas. ¿Qué haces?',
      opciones: {
        a: 'Lo compro sin pensarlo mucho.',
        b: 'Lo dejo, pero me cuesta olvidarlo.',
        c: 'Me lo permito si lo incluyo en mi presupuesto.',
        d: 'Me regalo cosas solo si he cumplido metas financieras.',
        e: 'No lo compro, prefiero mantener mi liquidez.'
      }
    },
    {
      id: 5,
      pregunta: 'Te ofrecen participar en un negocio nuevo con alto riesgo y posible rentabilidad. ¿Qué haces?',
      opciones: {
        a: 'Entro por intuición, si algo me vibra.',
        b: 'Me lo pienso mucho, pero al final no actúo.',
        c: 'Analizo datos, pregunto y luego decido.',
        d: 'Me sumo si veo que otras personas lo hacen.',
        e: 'No participo, prefiero no arriesgar.'
      }
    }
  ]

  const frasesParte3 = [
    'El dinero es una fuente constante de problemas.',
    'Si invierto, seguro que acabo perdiendo.',
    'No nací para entender de dinero.',
    'Me siento culpable si disfruto del dinero que gano.',
    'Prefiero que otra persona decida por mí en temas financieros.',
    'Las personas ricas tienen algo que yo no tengo y nunca tendré.',
    'Si no controlo cada detalle de mis finanzas, algo saldrá mal.',
    'El dinero no es para disfrutar, es para sobrevivir.',
    'Nunca tendré suficiente para vivir tranquila.',
    'Es mejor no mirar mis cuentas cuando tengo miedo o estrés.'
  ]

  const perfilesFinancieros = {
    'Impulsivo financiero': {
      descripcion: 'Eres una persona con gran sensibilidad emocional en lo económico. El dinero cumple muchas funciones en tu vida: desde darte sensación de libertad hasta calmar emociones incómodas. A menudo actúas por impulso, buscando gratificación inmediata sin evaluar del todo las consecuencias.',
      errores: [
        'Compras no planificadas o compensatorias.',
        'Poca claridad de objetivos financieros.',
        'Evitación de presupuestos, seguimiento o ahorro sistemático.',
        'Toma de decisiones sin información suficiente.'
      ],
      recomendaciones: [
        'Establece una "regla de las 24 horas" para evitar compras impulsivas.',
        'Crea un presupuesto flexible pero visible (apoyado en apps visuales).',
        'Practica el mindful spending: antes de gastar, respira, identifica la emoción y decide.',
        'Lleva un registro de compras con emociones asociadas para detectar patrones.'
      ]
    },
    'Postergador': {
      descripcion: 'Sueles saber lo que deberías hacer, pero lo postergas. Ya sea por inseguridad, miedo a equivocarte o simplemente saturación, tiendes a dejar las decisiones importantes para mañana. La ansiedad te bloquea, la duda te consume y muchas veces delegas tus decisiones económicas a otros.',
      errores: [
        'Retrasar decisiones clave (inversión, ahorro, cancelación de deudas).',
        'Dejar pasar oportunidades por falta de acción.',
        'Depender de otras personas para moverse financieramente.',
        'Cargar con la frustración de no avanzar.'
      ],
      recomendaciones: [
        'Fragmenta tus objetivos financieros en microdecisiones (de menos de 15 minutos).',
        'Usa recordatorios, calendarios o apps que te hagan avanzar paso a paso.',
        'Busca una figura de apoyo o mentoría que te acompañe sin decidir por ti.',
        'Establece una fecha fija para revisar tus finanzas cada semana.'
      ]
    },
    'Inversor consciente': {
      descripcion: 'Tomas decisiones informadas, equilibras razón y emoción y entiendes bien los principios económicos. Tienes una visión clara de largo plazo y sabes aplicar tus conocimientos para multiplicar tus recursos. Aceptas el riesgo como parte de la estrategia, sin perder el foco ni ceder ante el miedo.',
      errores: [
        'Sobreanálisis que puede generar parálisis en momentos clave.',
        'Desconexión emocional de otros miembros de tu entorno (si gestionas en pareja o familia).',
        'A veces, dificultad para explicar tu criterio a quienes te rodean.'
      ],
      recomendaciones: [
        'Revisa periódicamente tu estrategia financiera con indicadores reales.',
        'Explora nuevas formas de inversión alineadas con tus valores.',
        'Enseña a otros: transmitir lo aprendido fortalece tu propio enfoque.',
        'Profundiza en fiscalidad y eficiencia patrimonial.'
      ]
    },
    'Ahorrador crónico con miedo a invertir': {
      descripcion: 'Sientes seguridad en el control, el orden y la previsión. Ahorrar te da paz, pero invertir te genera vértigo. Tienes miedo a perder lo que tanto te ha costado ganar, y prefieres la estabilidad a la incertidumbre. Sin embargo, sabes que solo ahorrar no será suficiente a largo plazo.',
      errores: [
        'Tener dinero inmovilizado sin rendimiento real.',
        'No aprovechar la inflación ni el interés compuesto a tu favor.',
        'Tomar decisiones por exceso de prudencia.',
        'Autolimitación por miedo a lo que no controlas.'
      ],
      recomendaciones: [
        'Empieza con microinversiones en productos de bajo riesgo y alta liquidez.',
        'Aprende con simuladores antes de poner dinero real.',
        'Conecta con otras personas que superaron ese miedo y avanzaron.',
        'Replantea el riesgo como una herramienta, no como una amenaza.'
      ]
    },
    'Optimista irrealista': {
      descripcion: 'Eres positivo, vital y confías en que "todo saldrá bien". Pero esa confianza no siempre viene acompañada de análisis o estrategia. Tiendes a minimizar los riesgos o a evitar mirar con detalle tus finanzas. A veces, delegas o simplemente fluyes... hasta que llega un imprevisto.',
      errores: [
        'No tener fondo de emergencia ni previsión.',
        'Caer en deudas o malas inversiones por exceso de confianza.',
        'Actuar sin revisar consecuencias económicas.',
        'No planificar ni revisar tu realidad financiera.'
      ],
      recomendaciones: [
        'Crea una hoja de ruta sencilla con metas realistas.',
        'Usa herramientas visuales para entender tu flujo de dinero.',
        'Aprende a analizar con datos básicos antes de decidir.',
        'Rodéate de perfiles más estructurados que te complementen.'
      ]
    },
    'Realista estratégico': {
      descripcion: 'Tu enfoque combina racionalidad, conciencia emocional y acción. Tomas decisiones alineadas con tus metas, revisas tus finanzas con regularidad y sabes adaptarte a los cambios. Has logrado encontrar tu propio equilibrio y eso se refleja en tu salud financiera.',
      errores: [
        'Perfeccionismo o autoexigencia excesiva.',
        'Asumir demasiada carga financiera o de control en entornos familiares.',
        'Falta de reconocimiento interno por los logros ya alcanzados.'
      ],
      recomendaciones: [
        'Comparte lo que sabes: enseñar fortalece tu propia maestría.',
        'Explora áreas de impacto: inversiones sostenibles, donaciones conscientes, mentoring.',
        'Revisa tus metas a largo plazo: ¿qué legado quieres dejar?'
      ]
    }
  }

  const handleRespuestaParte1 = (valor: number) => {
    const factor = factoresParte1[factorActual]
    const nuevaRespuesta: RespuestaParte1 = {
      factor: factor.id,
      respuestas: [...(respuestasParte1.find(r => r.factor === factor.id)?.respuestas || []), valor]
    }

    const nuevasRespuestas = respuestasParte1.filter(r => r.factor !== factor.id)
    nuevasRespuestas.push(nuevaRespuesta)
    setRespuestasParte1(nuevasRespuestas)

    if (preguntaActualFactor < 2) {
      setPreguntaActualFactor(preguntaActualFactor + 1)
    } else {
      if (factorActual < factoresParte1.length - 1) {
        setFactorActual(factorActual + 1)
        setPreguntaActualFactor(0)
      } else {
        setParteActual('parte2')
        setFactorActual(0)
        setPreguntaActualFactor(0)
      }
    }
  }

  const handleRespuestaParte2 = (opcion: string) => {
    const caso = casosParte2[factorActual]
    const nuevaRespuesta: RespuestaParte2 = {
      caso: caso.id,
      opcion
    }

    const nuevasRespuestas = respuestasParte2.filter(r => r.caso !== caso.id)
    nuevasRespuestas.push(nuevaRespuesta)
    setRespuestasParte2(nuevasRespuestas)

    if (factorActual < casosParte2.length - 1) {
      setFactorActual(factorActual + 1)
    } else {
      setParteActual('parte3')
      setFactorActual(0)
    }
  }

  const handleRespuestaParte3 = (valor: number) => {
    const frase = factorActual + 1
    const nuevaRespuesta: RespuestaParte3 = {
      frase,
      valor
    }
    
    const nuevasRespuestas = respuestasParte3.filter(r => r.frase !== frase)
    nuevasRespuestas.push(nuevaRespuesta)
    setRespuestasParte3(nuevasRespuestas)

    if (factorActual < frasesParte3.length - 1) {
      setFactorActual(factorActual + 1)
    } else {
      calcularResultados()
    }
  }

  const calcularResultados = () => {
    // Calcular resultados Parte 1
    const resultadosParte1 = factoresParte1.map(factor => {
      const respuestas = respuestasParte1.find(r => r.factor === factor.id)?.respuestas || []
      const suma = respuestas.reduce((acc, val) => acc + val, 0)
      let nivel = 'Bajo'
      if (suma >= 12) nivel = 'Alto'
      else if (suma >= 8) nivel = 'Medio'
      return { factor: factor.nombre, suma, nivel }
    })

    // Calcular perfiles Parte 2
    const conteoOpciones: Record<string, number> = {}
    respuestasParte2.forEach(r => {
      conteoOpciones[r.opcion] = (conteoOpciones[r.opcion] || 0) + 1
    })

    const perfilesParte2: Record<string, string[]> = {
      a: ['Impulsivo financiero'],
      b: ['Ahorrador crónico con miedo a invertir', 'Postergador'],
      c: ['Postergador', 'Realista estratégico'],
      d: ['Inversor consciente', 'Realista estratégico'],
      e: ['Ahorrador crónico con miedo a invertir', 'Inversor consciente']
    }

    const perfilesDetectados: Record<string, number> = {}
    Object.entries(conteoOpciones).forEach(([opcion, count]) => {
      perfilesParte2[opcion]?.forEach(perfil => {
        perfilesDetectados[perfil] = (perfilesDetectados[perfil] || 0) + count
      })
    })

    const perfilDominante = Object.entries(perfilesDetectados)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Realista estratégico'

    // Analizar Parte 3
    const frasesAlta = respuestasParte3.filter(r => r.valor >= 4)
    const creenciasLimitantes = frasesAlta.length

    setResultados({
      parte1: resultadosParte1,
      perfilDominante,
      creenciasLimitantes,
      frasesAlta: frasesAlta.map(f => ({
        numero: f.frase,
        frase: frasesParte3[f.frase - 1],
        valor: f.valor
      }))
    })

    setParteActual('resultados')
  }

  const reiniciarTest = () => {
    setParteActual('intro')
    setRespuestasParte1([])
    setRespuestasParte2([])
    setRespuestasParte3([])
    setFactorActual(0)
    setPreguntaActualFactor(0)
    setResultados(null)
  }

  if (parteActual === 'intro') {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary-dark">
              Test psicofinanciero de Esmeralda
          </h1>
            <p className="text-lg italic text-secondary-dark/80 mb-2">
              "La duda es uno de los nombres de la inteligencia."
            </p>
            <p className="text-sm text-secondary-dark/70">JORGE LUIS BORGES, escritor (1899-1986)</p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-8 space-y-6 text-secondary-dark/90">
            <div className="space-y-4">
              <p>
                Este test nace como una invitación a detenerte, observarte y jugar contigo misma. 
                Es una herramienta de introspección lúdica, un espejo que refleja cómo se manifiesta 
                tu ser más íntimo a través de tu relación con el dinero.
              </p>
              <p>
                Porque el dinero, lejos de ser solo una cifra o un medio de intercambio, es una extensión 
                de tus elecciones más profundas, de tu memoria emocional, de esa arquitectura invisible 
                que modela el sentido de tus días.
              </p>
              <p>
                No pretende medir tu éxito ni revisar tu historial económico con lupa. Se trata, más bien, 
                de reconocer la trama —a veces inconexa, a veces luminosa— de tus decisiones financieras.
              </p>
            </div>

            <div className="bg-secondary-light/50 rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-secondary-dark">Estructura del test</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Parte 1. Escala del 1 al 5</p>
                    <p className="text-sm text-secondary-dark/70">Para medir hábitos y actitudes (10 factores, 30 preguntas)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Parte 2. Casos prácticos</p>
                    <p className="text-sm text-secondary-dark/70">Para evaluar cómo actúas (5 situaciones hipotéticas)</p>
                    </div>
                    </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Parte 3. Razonamiento emocional</p>
                    <p className="text-sm text-secondary-dark/70">Para detectar creencias profundas o bloqueos (10 frases proyectivas)</p>
                  </div>
                </div>
              </div>
          </div>

            <div className="bg-primary-50/50 rounded-xl p-6 border border-primary-200">
              <p className="text-sm italic">
                No tengas prisa. Hazlo como quien recorre una biblioteca secreta: con pausa, con reverencia, 
                con la íntima conciencia de que cada respuesta es una página escrita por una parte de ti que 
                apenas empieza a hablar.
              </p>
          </div>

            <button
              onClick={() => setParteActual('parte1')}
              className="w-full cta-button px-8 py-4 rounded-full text-lg font-semibold"
            >
              Comenzar el test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (parteActual === 'parte1') {
    const factor = factoresParte1[factorActual]
    const pregunta = factor.preguntas[preguntaActualFactor]
    const progreso = ((factorActual * 3 + preguntaActualFactor + 1) / 30) * 100

  return (
      <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-dark mb-2">Parte 1. Tu arquitectura invisible</h2>
            <p className="text-sm text-secondary-dark/70 mb-4">
              Factor {factorActual + 1} de {factoresParte1.length}: {factor.nombre}
            </p>
            <div className="w-full bg-secondary-light rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent-aqua via-accent-sky to-accent-indigo h-2 rounded-full transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-xs text-secondary-dark/60 mt-2">
              Pregunta {preguntaActualFactor + 1} de 3 en este factor • {Math.round(progreso)}% completado
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-8">
            <div className="mb-6">
              <p className="text-lg text-secondary-dark leading-relaxed">{pregunta}</p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-secondary-dark/70 mb-4">Selecciona tu respuesta:</p>
              {[1, 2, 3, 4, 5].map(valor => (
                <button
                  key={valor}
                  onClick={() => handleRespuestaParte1(valor)}
                  className="w-full text-left p-4 bg-secondary-light/50 hover:bg-secondary-light border-2 border-transparent hover:border-primary-500 rounded-xl transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-dark">
                      {valor === 1 && 'Nunca'}
                      {valor === 2 && 'Raramente'}
                      {valor === 3 && 'A veces'}
                      {valor === 4 && 'Frecuentemente'}
                      {valor === 5 && 'Siempre'}
                    </span>
                    <span className="text-primary-600 font-bold">{valor}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (parteActual === 'parte2') {
    const caso = casosParte2[factorActual]
    const progreso = ((factorActual + 1) / casosParte2.length) * 100

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-dark mb-2">Parte 2. Cuando la vida pregunta</h2>
            <p className="text-sm text-secondary-dark/70 mb-4">Caso {factorActual + 1} de {casosParte2.length}</p>
            <div className="w-full bg-secondary-light rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent-aqua via-accent-sky to-accent-indigo h-2 rounded-full transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-8">
            <div className="mb-6">
              <p className="text-lg font-semibold text-secondary-dark mb-2">CASO {caso.id}.</p>
              <p className="text-lg text-secondary-dark leading-relaxed">{caso.pregunta}</p>
            </div>

            <div className="space-y-3">
              {Object.entries(caso.opciones).map(([letra, texto]) => (
                <button
                  key={letra}
                  onClick={() => handleRespuestaParte2(letra)}
                  className="w-full text-left p-4 bg-secondary-light/50 hover:bg-secondary-light border-2 border-transparent hover:border-primary-500 rounded-xl transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary-600 text-lg">{letra.toUpperCase()})</span>
                    <span className="text-secondary-dark flex-1">{texto}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (parteActual === 'parte3') {
    const frase = frasesParte3[factorActual]
    const progreso = ((factorActual + 1) / frasesParte3.length) * 100

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-dark mb-2">Parte 3. Lo que crees sin saberlo</h2>
            <p className="text-sm text-secondary-dark/70 mb-4">Frase {factorActual + 1} de {frasesParte3.length}</p>
            <div className="w-full bg-secondary-light rounded-full h-2">
              <div
                className="bg-gradient-to-r from-accent-aqua via-accent-sky to-accent-indigo h-2 rounded-full transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-8">
            <div className="mb-6">
              <p className="text-lg text-secondary-dark leading-relaxed mb-4">{factorActual + 1}. {frase}</p>
              <p className="text-sm text-secondary-dark/70 italic">
                Marca cuánto te identificas con esta frase (1 = No me representa en absoluto, 5 = Me representa completamente)
              </p>
            </div>

          <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(valor => (
              <button
                  key={valor}
                  onClick={() => handleRespuestaParte3(valor)}
                  className="w-full text-left p-4 bg-secondary-light/50 hover:bg-secondary-light border-2 border-transparent hover:border-primary-500 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between">
                    <span className="font-medium text-secondary-dark">
                      {valor === 1 && 'No me representa en absoluto'}
                      {valor === 2 && 'Poco'}
                      {valor === 3 && 'Moderadamente'}
                      {valor === 4 && 'Bastante'}
                      {valor === 5 && 'Me representa completamente'}
                    </span>
                    <span className="text-primary-600 font-bold">{valor}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        </div>
      </div>
    )
  }

  if (parteActual === 'resultados' && resultados) {
    const perfil = perfilesFinancieros[resultados.perfilDominante as keyof typeof perfilesFinancieros]

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-secondary-dark">
              Tus Resultados
            </h1>
            <p className="text-secondary-dark/80">
              Conoce tu perfil financiero y descubre cómo mejorar tu relación con el dinero
            </p>
          </div>

          {/* Perfil Dominante */}
          <div className="bg-white/90 backdrop-blur rounded-2xl border-2 border-primary-500 shadow-glow-primary p-8">
            <div className="flex items-center gap-4 mb-4">
              <TrendingUp className="w-12 h-12 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-secondary-dark">Tu Perfil Financiero</h2>
                <p className="text-xl font-semibold text-primary-600">{resultados.perfilDominante}</p>
              </div>
            </div>
            <p className="text-secondary-dark/80 mb-6 leading-relaxed">{perfil.descripcion}</p>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-secondary-dark mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Errores frecuentes
                </h3>
                <ul className="space-y-2">
                  {perfil.errores.map((error, i) => (
                    <li key={i} className="text-sm text-secondary-dark/80 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-secondary-dark mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Recomendaciones
                </h3>
                <ul className="space-y-2">
                  {perfil.recomendaciones.map((rec, i) => (
                    <li key={i} className="text-sm text-secondary-dark/80 flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Resultados Parte 1 */}
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-secondary-light shadow-glow-primary p-8">
            <h3 className="text-xl font-bold text-secondary-dark mb-4">Parte 1. Tu arquitectura invisible</h3>
            <div className="space-y-4">
              {resultados.parte1.map((r: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-secondary-dark">{r.factor}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-secondary-dark">{r.suma} puntos</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.nivel === 'Alto' ? 'bg-green-100 text-green-700' :
                        r.nivel === 'Medio' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.nivel}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-secondary-light rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        r.nivel === 'Alto' ? 'bg-green-500' :
                        r.nivel === 'Medio' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(r.suma / 15) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Creencias Limitantes Parte 3 */}
          {resultados.creenciasLimitantes > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-secondary-dark mb-4">
                Creencias que requieren atención
              </h3>
              <p className="text-sm text-secondary-dark/80 mb-4">
                Has puntuado con 4 o 5 en {resultados.creenciasLimitantes} frase(s). 
                Estas creencias pueden estar condicionando tu relación con el dinero.
              </p>
              <div className="space-y-2">
                {resultados.frasesAlta.map((f: any) => (
                  <div key={f.numero} className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="text-sm text-secondary-dark">
                      <span className="font-semibold">{f.numero}.</span> {f.frase}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={reiniciarTest}
              className="cta-button px-8 py-3 rounded-full font-semibold"
            >
              Realizar Test Nuevamente
            </button>
          </div>
        </div>
    </div>
  )
  }

  return null
}

interface RespuestaBasica {
  pregunta: number
  valor: number
}

function FinancialHealthTest() {
  const router = useRouter()
  const [pasoActual, setPasoActual] = useState(0)
  const [respuestas, setRespuestas] = useState<RespuestaBasica[]>([])
  const [resultado, setResultado] = useState<any>(null)

  const preguntas = [
    {
      categoria: 'Gestión de Deudas',
      pregunta: '¿Cuál es tu situación actual con las deudas?',
      opciones: [
        { texto: 'No tengo deudas', valor: 10 },
        { texto: 'Tengo deudas pero las gestiono bien y las estoy pagando', valor: 7 },
        { texto: 'Tengo algunas deudas que me preocupan', valor: 4 },
        { texto: 'Tengo muchas deudas y me cuesta pagarlas', valor: 1 },
      ],
    },
    {
      categoria: 'Ahorro',
      pregunta: '¿Qué porcentaje de tus ingresos ahorras mensualmente?',
      opciones: [
        { texto: 'Más del 20%', valor: 10 },
        { texto: 'Entre 10% y 20%', valor: 8 },
        { texto: 'Entre 5% y 10%', valor: 5 },
        { texto: 'Menos del 5% o nada', valor: 2 },
      ],
    },
    {
      categoria: 'Fondo de Emergencia',
      pregunta: '¿Tienes un fondo de emergencia?',
      opciones: [
        { texto: 'Sí, tengo más de 6 meses de gastos ahorrados', valor: 10 },
        { texto: 'Sí, tengo entre 3 y 6 meses de gastos', valor: 7 },
        { texto: 'Sí, pero menos de 3 meses', valor: 4 },
        { texto: 'No tengo fondo de emergencia', valor: 1 },
      ],
    },
    {
      categoria: 'Planificación Financiera',
      pregunta: '¿Con qué frecuencia revisas y planificas tus finanzas?',
      opciones: [
        { texto: 'Mensualmente o más frecuente', valor: 10 },
        { texto: 'Trimestralmente', valor: 7 },
        { texto: 'Anualmente', valor: 4 },
        { texto: 'Nunca o casi nunca', valor: 1 },
      ],
    },
    {
      categoria: 'Conocimientos Financieros',
      pregunta: '¿Cómo calificarías tus conocimientos sobre finanzas personales?',
      opciones: [
        { texto: 'Muy buenos, me informo regularmente', valor: 10 },
        { texto: 'Buenos, tengo conocimientos básicos', valor: 7 },
        { texto: 'Regulares, sé lo básico', valor: 4 },
        { texto: 'Bajos, necesito aprender más', valor: 2 },
      ],
    },
    {
      categoria: 'Control de Gastos',
      pregunta: '¿Llevas un control de tus gastos?',
      opciones: [
        { texto: 'Sí, registro todos mis gastos detalladamente', valor: 10 },
        { texto: 'Sí, llevo un control general', valor: 7 },
        { texto: 'A veces, pero no de forma constante', valor: 4 },
        { texto: 'No, no controlo mis gastos', valor: 1 },
      ],
    },
    {
      categoria: 'Objetivos Financieros',
      pregunta: '¿Tienes objetivos financieros claros y definidos?',
      opciones: [
        { texto: 'Sí, tengo objetivos claros y un plan para alcanzarlos', valor: 10 },
        { texto: 'Sí, tengo algunos objetivos pero sin plan definido', valor: 6 },
        { texto: 'Tengo ideas vagas sobre mis objetivos', valor: 3 },
        { texto: 'No tengo objetivos financieros claros', valor: 1 },
      ],
    },
    {
      categoria: 'Inversiones',
      pregunta: '¿Inviertes parte de tus ahorros?',
      opciones: [
        { texto: 'Sí, invierto regularmente y diversifico', valor: 10 },
        { texto: 'Sí, tengo algunas inversiones', valor: 7 },
        { texto: 'He pensado en invertir pero no lo he hecho', valor: 3 },
        { texto: 'No invierto, solo ahorro', valor: 2 },
      ],
    },
    {
      categoria: 'Seguros y Protección',
      pregunta: '¿Tienes seguros adecuados (vida, salud, hogar)?',
      opciones: [
        { texto: 'Sí, tengo todos los seguros necesarios', valor: 10 },
        { texto: 'Tengo algunos seguros importantes', valor: 6 },
        { texto: 'Tengo seguros básicos', valor: 3 },
        { texto: 'No tengo seguros o son insuficientes', valor: 1 },
      ],
    },
    {
      categoria: 'Jubilación',
      pregunta: '¿Estás ahorrando o planificando para tu jubilación?',
      opciones: [
        { texto: 'Sí, tengo un plan de jubilación activo', valor: 10 },
        { texto: 'Sí, ahorro algo para la jubilación', valor: 6 },
        { texto: 'He pensado en ello pero no he empezado', valor: 3 },
        { texto: 'No he pensado en la jubilación', valor: 1 },
      ],
    },
  ]

  const seleccionarRespuesta = (valor: number) => {
    const nuevaRespuesta: RespuestaBasica = {
      pregunta: pasoActual,
      valor,
    }

    const nuevasRespuestas = [...respuestas]
    nuevasRespuestas[pasoActual] = nuevaRespuesta
    setRespuestas(nuevasRespuestas)

    if (pasoActual < preguntas.length - 1) {
      setPasoActual(pasoActual + 1)
    } else {
      calcularResultado(nuevasRespuestas)
    }
  }

  const calcularResultado = (respuestasCompletas: RespuestaBasica[]) => {
    const puntuacionTotal = respuestasCompletas.reduce((sum, r) => sum + r.valor, 0)
    const puntuacionMaxima = preguntas.length * 10
    const porcentaje = (puntuacionTotal / puntuacionMaxima) * 100

    let nivel = ''
    let color = ''
    let icono = null
    let descripcion = ''
    let recomendaciones: string[] = []

    if (porcentaje >= 80) {
      nivel = 'Excelente'
      color = 'text-green-600'
      icono = <CheckCircle className="w-12 h-12 text-green-600" />
      descripcion = 'Tienes una salud financiera excelente. Mantén tus buenos hábitos y continúa mejorando.'
      recomendaciones = [
        'Continúa diversificando tus inversiones',
        'Mantén tu fondo de emergencia actualizado',
        'Considera asesoramiento profesional para optimizar aún más',
        'Ayuda a otros a mejorar su salud financiera',
      ]
    } else if (porcentaje >= 65) {
      nivel = 'Buena'
      color = 'text-blue-600'
      icono = <TrendingUp className="w-12 h-12 text-blue-600" />
      descripcion = 'Tienes una buena base financiera. Hay áreas de mejora que pueden llevarte al siguiente nivel.'
      recomendaciones = [
        'Aumenta tu porcentaje de ahorro mensual',
        'Crea o mejora tu fondo de emergencia',
        'Diversifica tus inversiones si aún no lo has hecho',
        'Establece objetivos financieros más específicos',
      ]
    } else if (porcentaje >= 50) {
      nivel = 'Regular'
      color = 'text-yellow-600'
      icono = <AlertCircle className="w-12 h-12 text-yellow-600" />
      descripcion = 'Tu salud financiera es regular. Hay varias áreas que necesitan atención para mejorar tu situación.'
      recomendaciones = [
        'Crea un presupuesto mensual y cúmplelo',
        'Comienza a construir un fondo de emergencia',
        'Reduce tus deudas de alta prioridad',
        'Edúcate sobre finanzas personales',
        'Establece objetivos financieros claros',
      ]
    } else {
      nivel = 'Necesita Mejora'
      color = 'text-red-600'
      icono = <TrendingDown className="w-12 h-12 text-red-600" />
      descripcion = 'Tu salud financiera necesita atención inmediata. Con pequeños cambios puedes mejorar significativamente.'
      recomendaciones = [
        'Prioriza el pago de deudas de alto interés',
        'Crea un presupuesto básico y controla tus gastos',
        'Comienza a ahorrar aunque sea una pequeña cantidad',
        'Busca educación financiera gratuita',
        'Considera asesoramiento profesional',
        'Establece un fondo de emergencia como prioridad',
      ]
    }

    const categorias = preguntas.map((p, i) => ({
      nombre: p.categoria,
      puntuacion: respuestasCompletas[i]?.valor || 0,
      maximo: 10,
    }))

    setResultado({
      puntuacionTotal,
      puntuacionMaxima,
      porcentaje: porcentaje.toFixed(1),
      nivel,
      color,
      icono,
      descripcion,
      recomendaciones,
      categorias,
    })
  }

  const reiniciarTest = () => {
    setPasoActual(0)
    setRespuestas([])
    setResultado(null)
  }

  if (resultado) {
    return (
      <div className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Resultados del Test</h2>
          <p className="text-center text-gray-600 mb-8">Tu salud financiera ha sido evaluada</p>
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-8 mb-8 text-center">
            <div className="flex justify-center mb-4">{resultado.icono}</div>
            <h3 className={`text-3xl font-bold mb-2 ${resultado.color}`}>{resultado.nivel}</h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">{resultado.porcentaje}%</div>
            <p className="text-lg text-gray-700 mb-4">{resultado.descripcion}</p>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  resultado.porcentaje >= 80
                    ? 'bg-green-600'
                    : resultado.porcentaje >= 65
                    ? 'bg-blue-600'
                    : resultado.porcentaje >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${resultado.porcentaje}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              Puntuación: {resultado.puntuacionTotal} / {resultado.puntuacionMaxima}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4">Puntuación por Categoría</h4>
            <div className="space-y-4">
              {resultado.categorias.map((cat: any, index: number) => {
                const porcentajeCat = (cat.puntuacion / cat.maximo) * 100
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{cat.nombre}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {cat.puntuacion} / {cat.maximo}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          porcentajeCat >= 80
                            ? 'bg-green-500'
                            : porcentajeCat >= 60
                            ? 'bg-blue-500'
                            : porcentajeCat >= 40
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${porcentajeCat}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-primary-600" />
              Recomendaciones para mejorar
            </h4>
            <ul className="space-y-3">
              {resultado.recomendaciones.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={reiniciarTest}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Realizar test nuevamente
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Ir al dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const preguntaActual = preguntas[pasoActual]

  return (
    <div className="bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
          Test de Salud Financiera
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Descubre la base de tu salud financiera respondiendo estas preguntas rápidas.
        </p>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Pregunta {pasoActual + 1} de {preguntas.length}</span>
            <span>{Math.round(((pasoActual + 1) / preguntas.length) * 100)}% completado</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all"
              style={{ width: `${((pasoActual + 1) / preguntas.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-6">
          <div className="mb-4">
            <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
              {preguntaActual.categoria}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">{preguntaActual.pregunta}</h3>

          <div className="space-y-3">
            {preguntaActual.opciones.map((opcion, index) => (
              <button
                key={index}
                onClick={() => seleccionarRespuesta(opcion.valor)}
                className="w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">{opcion.texto}</span>
                  <DollarSign className="w-5 h-5 text-primary-600" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {pasoActual > 0 && (
          <div className="text-center">
            <button
              onClick={() => setPasoActual(pasoActual - 1)}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Anterior
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TestPage() {
  const [testActivo, setTestActivo] = useState<'esmeralda' | 'finanzas'>('esmeralda')

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto text-center py-12 px-4 space-y-4">
        <p className="text-sm font-semibold tracking-[0.3em] uppercase text-primary-600">Tests financieros</p>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary-dark">
          Explora tu perfil financiero
        </h1>
        <p className="text-secondary-dark/80 max-w-3xl mx-auto">
          Elige entre el Test Psicofinanciero de Esmeralda (profundiza en tu arquitectura emocional)
          o el Test de Salud Financiera rápida (evalúa tus hábitos actuales).
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => setTestActivo('esmeralda')}
            className={`px-6 py-3 rounded-full text-sm font-semibold border transition-colors ${
              testActivo === 'esmeralda'
                ? 'border-primary-600 text-white bg-primary-600'
                : 'border-secondary-light text-secondary-dark hover:border-primary-400'
            }`}
          >
            Test psicofinanciero
          </button>
          <button
            onClick={() => setTestActivo('finanzas')}
            className={`px-6 py-3 rounded-full text-sm font-semibold border transition-colors ${
              testActivo === 'finanzas'
                ? 'border-primary-600 text-white bg-primary-600'
                : 'border-secondary-light text-secondary-dark hover:border-primary-400'
            }`}
          >
            Test de Salud Financiera
          </button>
        </div>
      </div>

      {testActivo === 'esmeralda' ? <EsmeraldaTest /> : <FinancialHealthTest />}
    </div>
  )
}
