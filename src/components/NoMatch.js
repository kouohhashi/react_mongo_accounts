import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

class NoMatch extends Component {

  render() {

    return(
      <div className='nomach'>
        <span>NoMatch</span>
      </div>
    )
  }
}

// react-redux
function mapStateToProps ( {user} ) {
  return {
    user
  }
}

// export default withRouter(MainPage);
export default withRouter( connect( mapStateToProps )(NoMatch) )
