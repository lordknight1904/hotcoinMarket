import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { Typeahead } from 'react-bootstrap-typeahead';
import { InputGroup, Button, DropdownButton, MenuItem, SplitButton } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl';

import { getCities, getDistricts, getCurrentPage } from '../../AppReducer';
import { fetchDistrict } from '../../AppActions';
import { fetchSearch } from '../../../App/AppActions';

class SearchBar extends Component {
  constructor(props){
    super(props);
    this.state = {
      city: 'City',
      district: 'District',
      fee: 'Fee',
      name: '',
    };
  }
  handleChange = (e) => {
    e.preventDefault();

  };
  handleSearch = (e) => {
    const name = (typeof e === 'string') ? e : this.state.name;
    if (typeof e === 'string') this.setState({ name: e });
    const city = (this.state.city !== 'City') ? this.state.city : null;
    const district = (this.state.district !== 'District') ? this.state.district : null;
    const fee = (this.state.fee !== 'Fee') ? this.state.fee : null;
    const page = this.props.currentPage;
    let path = 'search?';
    let nameBool = false, cityBool: false, districtBool: false, feeBool: false;
    if(name !== null && name !== '')  { path += `name=${name}`; nameBool = true; }
    if(city !== null) { path += (nameBool) ? `&city=${city}` : `city=${city}`; cityBool = true; }
    if(district !== null) { path += (nameBool || cityBool) ? `&district=${district}` : `district=${district}`; districtBool = true; }
    if(fee !== null) { path += (nameBool || cityBool || districtBool) ? `&fee=${fee}` : `fee=${fee}`; feeBool = true; }
    if(page > 1) { path += (nameBool || cityBool || districtBool || feeBool) ? `&page=${page}` : `page=${page}`; }
    this.context.router.push(`/${path}`);
    this.props.dispatch(fetchSearch(path));
  };
  handleCity = (city) => {
    this.setState({ city: city.value });
    this.props.dispatch(fetchDistrict(city._id));
  };
  handleDistrict = (district) => {
    this.setState({ district: district.value });
  };
  handleFee = (fee) => {
    this.setState({ fee });
  };
  render() {
    const myData = [
    ];
    return (
      <div>
        <form onSubmit={e => this.handleChange(e)}>
          <InputGroup>
            <InputGroup.Button>
              <DropdownButton
                componentClass={InputGroup.Button}
                id="input-dropdown-addon"
                title={<FormattedMessage id={this.state.city} />}
                style={{
                  border: '1px solid transparent',
                  borderColor: '#ccc'
                }}
              >
                {
                  this.props.cities.map((city, index) => (
                    <MenuItem key={index} value={city.value} onSelect={() => this.handleCity(city)}>{<FormattedMessage id={city.value} />}</MenuItem>
                  ))
                }
              </DropdownButton >
              <DropdownButton
                componentClass={InputGroup.Button}
                id="input-dropdown-addon"
                title={<FormattedMessage id={this.state.district} />}
                style={{
                  border: '1px solid transparent',
                  borderColor: '#ccc'
                }}
              >
                {
                  this.props.districts.map((district, index) => (
                    <MenuItem key={index} value={district.value} onSelect={() => this.handleDistrict(district)}>{<FormattedMessage id={district.value} />}</MenuItem>
                  ))
                }
              </DropdownButton>
            </InputGroup.Button>

            <Typeahead
              align='justify'
              onInputChange={e => this.handleSearch(e)}
              options={myData}
              placeholder={this.props.intl.messages.typeaheadPH}
              emptyLabel=''
              submitFormOnEnter
            />

            <InputGroup.Button>
              <DropdownButton
                componentClass={InputGroup.Button}
                id="input-dropdown-addon"
                title={<FormattedMessage id={this.state.fee} />}
                style={{
                  border: '1px solid transparent',
                  borderColor: '#ccc'
                }}
              >
                <MenuItem key="1" value="none" onSelect={() => this.handleFee("none")}>{<FormattedMessage id="none" />}</MenuItem>
                <MenuItem key="2" value="500" onSelect={() => this.handleFee("500")}>>{<FormattedMessage id="500" />}</MenuItem>
                <MenuItem key="3" value="1000" onSelect={() => this.handleFee("1000")}>>{<FormattedMessage id="1000" />}</MenuItem>
              </DropdownButton>
            </InputGroup.Button>
            <InputGroup.Button>
              <Button
                type="submit"
                onClick={this.handleSearch}
                style={{
                  border: '1px solid transparent',
                  borderColor: '#ccc'
                }}
              >
                {<FormattedMessage id="search" />}
              </Button>
            </InputGroup.Button>

          </InputGroup>
        </form>
      </div>
    );
  }
}

// Actions required to provide data for this component to render in sever side.
// PostListPage.need = [() => { return fetchPosts(); }];

function mapStateToProps(state) {
  return {
    intl: state.intl,
    cities: getCities(state),
    districts: getDistricts(state),
    currentPage: getCurrentPage(state),
  };
}

SearchBar.propTypes = {
  intl: PropTypes.object.isRequired,
  districts: PropTypes.array.isRequired,
  cities: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
};

SearchBar.contextTypes = {
  router: PropTypes.object,
};

export default connect(mapStateToProps)(SearchBar);
