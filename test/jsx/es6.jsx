import mod from 'somewhere';

function getInitialState() {
  return mod;
}

function render() {
  return (
    <div>
    </div>
  );
}

export default React.createClass({
  getInitialState: getInitialState,
  render: render
});
