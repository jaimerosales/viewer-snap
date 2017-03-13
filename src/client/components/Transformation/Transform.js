
/// WHY I'M USING GLOBAL VARIABLES, SIMPLE I'M SETTING UP WITH REACT-SCRIPTS FOR EASIER 3RD PARTY DEVELOPER USE OF PROJECT
/// https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#using-global-variables

  const THREE = window.THREE;  


    /////////////////////////////////////////////////////////////
    // Gets input transform
    //
    /////////////////////////////////////////////////////////////
    function getScale() {

      var x = parseFloat(0.2)
      var y = parseFloat(0.2)
      var z = parseFloat(0.2)

      x = isNaN(x) ? 1.0 : x;
      y = isNaN(y) ? 1.0 : y;
      z = isNaN(z) ? 1.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getTranslation() {

      var x = parseFloat(0.0)
      var y = parseFloat(0.0)
      var z = parseFloat(0.0)

      x = isNaN(x) ? 0.0 : x;
      y = isNaN(y) ? 0.0 : y;
      z = isNaN(z) ? 0.0 : z;

      return new THREE.Vector3(x, y, z);
    }

    function getRotation() {

      var x = parseFloat(90.00)
      var y = parseFloat(0.00)
      var z = parseFloat(0.00)

      x = isNaN(x) ? 0.0 : x;
      y = isNaN(y) ? 0.0 : y;
      z = isNaN(z) ? 0.0 : z;

      var euler = new THREE.Euler(
        x * Math.PI/180,
        y * Math.PI/180,
        z * Math.PI/180,
        'XYZ');

      var q = new THREE.Quaternion();

      q.setFromEuler(euler);

      return q;
    }

    /////////////////////////////////////////////////////////////
    // Builds transform matrix
    //
    /////////////////////////////////////////////////////////////
    function buildTransformMatrix() {
      
      var t = getTranslation();
      var r = getRotation();
      var s = getScale();
      
      var m = new THREE.Matrix4();

      m.compose(t, r, s);
     
      return m;
    }


const Transform = {
  buildTransformMatrix
};

export default Transform;