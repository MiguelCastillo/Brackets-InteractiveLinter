class Tardis extends TimeMachine
  go: ->
    super "vorp vorp"

class DeLorean extends TimeMachine
  go: ->
    super "One point twenty-one gigawatts!"

doctors_wife = new Tardis "The Doctor"
doc_browns_wheels = new DeLorean "Marty"

doctors_wife.go()
doc_browns_wheels.go()
