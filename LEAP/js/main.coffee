`// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}`

initScene = (element)->
  window.scene = new THREE.Scene()

  window.renderer = new THREE.WebGLRenderer(alpha: true)
  #renderer.setClearColor( 0x000000, 0) # for overlay on page
  renderer.setClearColor(0x000000, 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  element.appendChild(renderer.domElement)

  axis = new THREE.AxisHelper(5)
  scene.add axis

  scene.add new THREE.AmbientLight(0x888888)
  #directionalLight = new THREE.DirectionalLight(  0xffffff, 1 )
  #directionalLight.position.set( 10, -10, 10 );
  #scene.add( directionalLight );

  pointLight = new THREE.PointLight(0xFFffff)
  pointLight.position = new THREE.Vector3(-20, 10, 0)
  pointLight.lookAt new THREE.Vector3(0, 0, 0)
  scene.add(pointLight)

  window.camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    1,
    1000
  )

  camera.position.fromArray([0,3,15])
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  window.controls = new THREE.TrackballControls( camera )
  scene.add(camera)

  window.addEventListener( 'resize', ->
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize( window.innerWidth, window.innerHeight )

    controls.handleResize()

    renderer.render(scene, camera)
  , false );

  renderer.render(scene, camera)


initScene(document.body)

window.stats = new Stats();

stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';

document.body.appendChild( stats.domElement );


controller = (new Leap.Controller)
controller.use('handHold')
  .use('handEntry')
  .use('riggedHand', {
    parent: scene

    renderFn: ()->
      renderer.render(scene, camera)
      controls.update()

    materialOptions: {
      wireframe: getParam('wireframe')
    }
    # set ?dots=true in the URL to show raw joint positions
    dotsMode: getParam('dots')
  })
  .connect()

if getParam('spy')
  $.get 'http://lm-007.herokuapp.com/record_json/brian', (data)->
    spy = window.LeapUtils.record_controller(controller, 500)
    spy.replay({
      frames: data.frames,
      loop: true,
      play_same_frames: true
    })

