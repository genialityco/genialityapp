import { Component } from 'react'
import { Button, Pagination as PaginationAnt } from 'antd'

class Pagination extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pager: {},
      datos: [],
    }
  }

  componentDidMount() {
    const auxArr = this.props.items
    this.setPage(this.props.initialPage, auxArr)
  }
  componentDidUpdate(prevProps) {
    if (
      this.props.items !== prevProps.items ||
      this.props.updatetable !== prevProps.updatetable
    ) {
      const auxArr = this.props.items
      this.setPage(this.state.pager.currentPage, auxArr)
    }
  }

  getDerivedStateFromProps(nextProps) {
    if (
      nextProps.items.length !== this.props.items.length ||
      nextProps.change !== this.props.change
    ) {
      const auxArr = nextProps.items
      this.setPage(nextProps.initialPage, auxArr)
    }
  }

  setPage = (page, items) => {
    const pageSize = 10
    let pageOfItems
    const pager = this.getPager(items.length, page, pageSize)

    this.setState({ pager: pager, datos: items })

    if (items.length > 0) {
      pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1)
    } else {
      pageOfItems = []
    }

    this.props.onChangePage(pageOfItems)
  }

  getPager = (totalItems, currentPage, pageSize) => {
    currentPage = currentPage || 1
    pageSize = pageSize || 10
    const totalPages = Math.ceil(totalItems / pageSize)

    let startPage, endPage
    if (totalPages <= 10) {
      startPage = 1
      endPage = totalPages
    } else {
      if (currentPage <= 6) {
        startPage = 1
        endPage = 10
      } else if (currentPage + 4 >= totalPages) {
        startPage = totalPages - 9
        endPage = totalPages
      } else {
        startPage = currentPage - 5
        endPage = currentPage + 4
      }
    }
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1)

    const pages = [...Array(endPage + 1 - startPage).keys()].map((i) => startPage + i)

    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages,
    }
  }

  render() {
    const totalItemsCount = this.props.totalItemsCount / 10
    const pages = []
    for (let i = 0; i < totalItemsCount; ++i) {
      pages.push(i + 1)
    }
    const pager = this.state.pager
    if (!pager.pages || pager.pages.length <= 1) {
      return null
    }
    return (
      <>
        <PaginationAnt
          defaultCurrent={1}
          current={pager.currentPage}
          defaultPageSize={10}
          total={this.props.items.length}
          onChange={(e) => this.setPage(e, this.state.datos)}
        />
      </>
    )
  }
}

export default Pagination
