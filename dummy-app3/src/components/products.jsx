import React from "react";
import * as ReactBootstrap from "react-bootstrap";
import axios from "axios";
import {
  Card,
  Accordion,
  Button,
  Container,
  Row,
  Col,
  Image,
} from "react-bootstrap";
import { useAccordionButton } from "react-bootstrap/AccordionButton";

const products = [
  { name: "Apples", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
  { name: "Bananas", country: "Colombia", cost: 4, instock: 5 },
  { name: "Watermelon", country: "Ghana", cost: 6, instock: 6 },
  { name: "Tomatoes", country: "Mexico", cost: 2, instock: 12 },
  { name: "Coffee", country: "Brazil", cost: 10, instock: 5 },
];
//=========Cart=============

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  console.log(`useDataApi called`);

  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);

  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {
      data: [],
    }
  );

  console.log(`Rendering Products ${JSON.stringify(data)}`);

  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name === name);
    console.log(`add to Cart ${JSON.stringify(item)}`);
    setCart([...cart, ...item]);
    if (item[0].instock > 0) {
      item[0].instock = item[0].instock - 1;
    } else {
      let newCart = cart.filter((item, index) => !item[0]);
      setCart(newCart);
    }
  };

  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index !== i);
    setCart(newCart);
    console.log(cart);
  };

  let list = items.map((item, index) => {
    let n = index + 500;
    let picsum = "https://picsum.photos/" + n;

    return (
      <li key={index}>
        <Image src={picsum} width={70} roundedCircle></Image>
        <br />
        <Button variant="primary" size="large">
          {item.name}
          :&nbsp;${item.cost}
          <br />
          Instock: {item.instock}
        </Button>
        <br />
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      deleteCartItem(eventKey - 1)
    );

    return (
      <Button type="button" onClick={decoratedOnClick}>
        {children}
      </Button>
    );
  }

  let cartList = cart.map((item, index) => {
    return (
      <Accordion defaultActiveKey="0">
        <Card key={index}>
          <Card.Header>
            <CustomToggle as={Button} variant="link" eventKey={1 + index}>
              {item.name}
            </CustomToggle>
            {/*<Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>*/}
          </Card.Header>
          <Accordion.Collapse eventKey="0">
            <Card.Body>
              {item.name} from {item.country}; ${item.cost}
            </Card.Body>
          </Accordion.Collapse>
          {/*<Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            ${item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>*/}
        </Card>
      </Accordion>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };

  const restockProducts = async (url) => {
    const response = await axios.get(url);
    const newSet = response.data.data.map((item) => {
      return {
        name: item.attributes.name,
        country: item.attributes.country,
        cost: item.attributes.cost,
        instock: item.attributes.instock,
      };
    });
    setItems([...newSet]);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
export default Products;
