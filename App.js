import React from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [inputSearch, setInputSearch] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [drugsInfo, setDrugsInfo] = React.useState([]);
  const [suggestionList, setSuggestionList] = React.useState([]);
  const [nDCList, setNDCList] = React.useState([]);
  const [showErrorMsg, setShowErrorMsg] = React.useState('');

  const searchInputDrugs = (searchValue) => {
    setInputSearch(searchValue);
  }

  const handleSearchBtnClick = () => {
    callApi();
  }

  const handleEnterClick = (event) => {
    if (event.key === 'Enter') {
      callApi();
    }
  }

  const callApi = async () => {
    setLoading(true);
    const res = await axios({ url: `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${inputSearch}` });
    const drugGroup = await res.data.drugGroup;

    if (!(drugGroup && drugGroup.conceptGroup)) {
      const suggestionsRes = await axios({ url: `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${inputSearch}` });
      const data = await suggestionsRes.data;
      const suggestionList = data.suggestionGroup.suggestionList.suggestion;

      if (suggestionList && suggestionList.suggestion) {
        setDrugsInfo([]);
        setLoading(false);
        setSuggestionList(suggestionList.suggestion);
      } else {
        setShowErrorMsg('Nothing could be found for entered drug name!');
        setDrugsInfo([]);
        setLoading(false);
        setSuggestionList([]);
      }
    } else {
      const drugDetails = drugGroup.conceptGroup[1].conceptProperties;
      setLoading(false);
      setDrugsInfo(drugDetails);
    }
  }

  const fetchDrugDetails = async (rxcui) => {
    const res = await axios({
      url: `https://rxnav.nlm.nih.gov/REST/rxcui/${rxcui}/ndcs`,
    });
    const ndcGroup = await res.data.ndcGroup;
    setNDCList(ndcGroup.ndcList.ndc);
  }


  return (
    <div className="App">
      Search for drugs!
      <br />
      <input
        placeholder='Search'
        onChange={(e) => searchInputDrugs(e.target.value)}
        value={inputSearch}
        onKeyDown={handleEnterClick}
      />
      <button onClick={handleSearchBtnClick}>Search Icon btn</button>
      <br />
      <br />
      {showErrorMsg}
      {loading && (
        <span>Loading...</span>
      )}
      <br />
      <br />
      <ol>
        {drugsInfo.map((item, key) => {
          return (
            <li key={key} onClick={() => fetchDrugDetails(item.rxcui)}>
              {item.name}
            </li>
          );
        })}
      </ol>

      <br />
      <br />
      <ol>
        {suggestionList.map((item, key) => {
          return (
            <li key={key}>
              {item}
            </li>
          );
        })}
      </ol>

      <br />
      <br />
      <ol>
        {nDCList.map((item, key) => {
          return (
            <li key={key} onClick={() => fetchDrugDetails(item)}>
              {item}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default App;
