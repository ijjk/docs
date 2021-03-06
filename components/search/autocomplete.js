import { Component } from 'react'
import Link from 'next/link'
import cn from 'classnames'
import { withRouter } from 'next/router'
import PropTypes from 'prop-types'
import AutoSuggest from 'react-autosuggest'
import {
  Highlight,
  connectAutoComplete,
  Snippet
} from 'react-instantsearch-dom'
import SearchIcon from '~/components/icons/search'
import * as metrics from '~/lib/metrics'

class AutoComplete extends Component {
  static propTypes = {
    hits: PropTypes.arrayOf(PropTypes.object).isRequired,
    currentRefinement: PropTypes.string.isRequired,
    refine: PropTypes.func.isRequired
  }

  state = {
    value: '',
    inputFocused: false
  }

  componentDidMount() {
    if (this.props.router.query.query) {
      this.setState({
        value: decodeURIComponent(this.props.router.query.query) || ''
      })
    }
  }

  onChange = (_, { newValue }) => {
    if (!newValue && this.props.onSuggestionCleared) {
      this.props.onSuggestionCleared()
    }

    this.setState({ value: newValue })
  }

  onToggleFocus = () => {
    metrics.event({ action: 'search_focused', category: 'engagement' })
    this.setState({ inputFocused: !this.state.inputFocused })
  }

  onSuggestionsFetchRequested = ({ value }) => {
    this.props.refine(value)
  }

  onSuggestionsClearRequested = () => {
    this.props.refine()
  }

  onSuggestionSelected = (_, { suggestion, method }) => {
    if (this.props.onSuggestionSelected)
      this.props.onSuggestionSelected(_, { suggestion })

    if (method === 'enter') {
      this.props.router.push({
        pathname: suggestion.url,
        query: { query: encodeURIComponent(this.state.value) },
        hash: suggestion.anchor
      })
    }
  }

  getSuggestionValue = () => this.state.value

  renderSuggestion = hit => {
    return (
      <Link
        href={`${hit.url}?query=${encodeURIComponent(this.state.value)}${
          hit.anchor ? `${hit.anchor}` : ''
        }`}
        prefetch
      >
        <a>
          <span className="suggestion__title">
            <Highlight attribute="title" tagName="mark" hit={hit} />
            <div className="tags">
              {hit._tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </span>
          {hit.section && (
            <span className="suggestion__section">
              <Highlight attribute="section" tagName="mark" hit={hit} />
            </span>
          )}
          <span className="suggestion__content">
            <Snippet hit={hit} attribute="content" tagName="mark" />
          </span>
        </a>
      </Link>
    )
  }

  render() {
    const { hits } = this.props
    const { value, inputFocused } = this.state

    const inputProps = {
      onChange: this.onChange,
      onFocus: this.onToggleFocus,
      onBlur: this.onToggleFocus,
      value
    }

    return (
      <span
        className={cn('search__container', {
          focused: inputFocused,
          'has-value': !!value.length
        })}
      >
        {!this.state.value && (
          <span className="search__search-placeholder">
            <SearchIcon />
            <span>Search...</span>
          </span>
        )}

        <AutoSuggest
          suggestions={hits}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          onSuggestionSelected={this.onSuggestionSelected}
          getSuggestionValue={this.getSuggestionValue}
          highlightFirstSuggestion={true}
          renderSuggestion={this.renderSuggestion}
          inputProps={inputProps}
        />

        <style jsx global>{`
          .search__container {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .search__search-placeholder {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            position: absolute;
            z-index: 3;
            transition: opacity 0.15s ease;
            font-size: 14px;
            color: var(--accents-5);
            pointer-events: none;
          }

          .search__search-placeholder svg {
            fill: currentColor;
            margin-right: 8px;
            margin-bottom: -2px;
          }

          .suggestion__title {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 8px;
            line-height: 1.5em;
            display: flex;
            align-items: center;
          }

          .suggestion__section {
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 12px;
            display: block;
          }

          .suggestion__content {
            font-size: 14px;
            color: #333;
            display: block;
            line-height: 1.6;
          }

          .tags {
            margin-left: 8px;
            height: 22px;
          }

          .tags .tag {
            border-radius: 4px;
            border: 1px solid #eaeaea;
            background: white;
            font-size: 10px;
            text-transform: uppercase;
            padding: 4px 8px;
            margin: 4px 0;
          }

          .tags .tag.docs {
            background: #50e3c2;
          }
          .tags .tag.guide {
            background: #5c52d2;
          }

          .react-autosuggest__suggestion mark {
            color: #000;
            font-weight: 500;
            background: yellow;
          }

          .react-autosuggest__container {
            position: relative;
          }

          .react-autosuggest__input {
            text-align: center;
            width: 528px;
            height: 48px;
            padding: 16px;
            font-size: 14px;
            border: 1px solid var(--accents-2);
            border-radius: 8px;
            transition: border 0.15s ease;
            -webkit-appearance: none;
          }

          .react-autosuggest__input:hover {
            border: 1px solid var(--accents-3);
          }

          .search__container.focused .react-autosuggest__input,
          .react-autosuggest__input:focus,
          .react-autosuggest__input:valid {
            border: 1px solid #ddd;
            outline: 0;
            text-align: left;
          }

          .search__container.focused .react-autosuggest__input,
          .react-autosuggest__input:focus {
            border-color: transparent;
            box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
            border-bottom: 1px solid var(--accents-2);
          }

          .search__container.has-value.focused .react-autosuggest__input,
          .search__container.has-value .react-autosuggest__input:focus {
            border-radius: 8px 8px 0 0;
          }

          .search__container.focused .search__search-placeholder {
            opacity: 0;
          }

          .react-autosuggest__suggestions-container {
            display: none;
            max-height: calc(90vh - 334px);
            min-height: 168px;
            overflow-y: auto;
            padding: 12px 0;
          }

          .react-autosuggest__suggestions-container--open {
            display: block;
            position: absolute;
            z-index: 2;
            width: 100%;
            top: 48px;
            background: #ffffff;
            box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.12);
            border-radius: 0 0 8px 8px;
          }

          .react-autosuggest__suggestions-list {
            margin: 0;
            padding: 0;
            list-style-type: none;
            overflow-y: auto;
          }

          .react-autosuggest__suggestion {
            cursor: pointer;
            padding: 10px 20px;
            padding: 12px 16px;
          }

          .react-autosuggest__suggestion {
            padding: 0 12px;
          }

          .react-autosuggest__suggestion a {
            text-decoration: none;
            color: black;
            border-radius: 4px;
            display: block;
            padding: 12px;
          }

          .react-autosuggest__suggestion--highlighted a {
            background: var(--accents-1);
          }

          .react-autosuggest__suggestion--highlighted a span {
            color: var(--geist-foreground);
          }

          .react-autosuggest__section-container {
            border-top: 1px dashed #ccc;
          }

          .react-autosuggest__section-container--first {
            border-top: 0;
          }

          .react-autosuggest__section-title {
            padding: 10px 0 0 10px;
            font-size: 12px;
            color: #777;
          }

          @media screen and (max-width: 950px) {
            .react-autosuggest__input {
              font-size: 16px;
              width: 300px;
            }

            .react-autosuggest__suggestions-container--open {
              left: 50%;
              transform: translate(-50%);
              width: 300px;
            }
            .search__search-placeholder svg {
              left: 100px;
            }
          }

          @media screen and (max-width: 350px) {
            .react-autosuggest__input {
              font-size: 16px;
              width: 200px;
            }

            .react-autosuggest__suggestions-container--open {
              left: 50%;
              transform: translate(-50%);
              width: 200px;
            }

            .search__search-placeholder svg {
              left: 50px;
            }
          }
        `}</style>
      </span>
    )
  }
}

export default withRouter(connectAutoComplete(AutoComplete))
