import Form from './react_components/Form'

class SignupMain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      futureTournaments: [...this.props.tournaments],
      input: {
        name: '',
        partner: '',
        selectedTournament: ''
      }
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      `${e.target.id}`: e.target.value
    })
  }

  handleSubmit(e) {
    e.preventDefault()

  }

  render() {
    return (
      <Form
        input={this.state.input}
        tournaments={this.state.futureTournaments}
        onChange={this.handleChange}
        onSubmit={this.handleSubmit}
      />
    )
  }
}

export default SignupMain;
