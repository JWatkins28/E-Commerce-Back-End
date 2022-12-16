const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// API/PRODUCTS ENDPOINT

// GET ALL PRODUCTS
router.get('/', async (req, res) => {

  try {

    const productData = await Product.findAll({ include: [{ model: Category, model: Tag, through: ProductTag, as: 'products_tags' }] });

    res.status(200).json(productData);

  } catch (err) { res.status(500).json(err) }

});

// GET PRODCUT BY 'ID'
router.get('/:id', async (req, res) => {

  try {

    const productData = await Product.findByPk(req.params.id, {
      include: [{  model: Tag, through: ProductTag, as: 'products_tags' }]
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' })
      return;
    }

    res.status(200).json(productData);

  } catch (err) { res.status(500).json(err) }

});

// CREATE A PRODUCT
router.post('/', (req, res) => {
  Product.create(req.body)
    .then((product) => {
      // BULK CREATE IF THERE'S TAGS
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // IF NO TAGS JUST RESPOND
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// UPDATE PRODUCT
router.put('/:id', (req, res) => {
  // UPDATE PRODUCT DATA
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // FIND ALL ASSOCIATED TAGS FROM ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // GET LIST OF ALL TAG_IDs
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // CREATE FILTERED LIST OF NEW TAG_IDs
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => { return { product_id: req.params.id, tag_id };
        });
      // FIGURING OUT WHICH ONES TO REMOVE
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // EXECUTE BOTH ACTIONS
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      res.status(400).json(err);
    });
});

// DELETE A PRODUCT BY 'ID'
router.delete('/:id', async (req, res) => {

  try {

    const productData = await Product.destroy({ where: { id: req.params.id } });

    if (!productData) {
      res.status(404).json({ message: 'No category with this ID!' });
      return;
    }

    res.status(200).json(productData)

  } catch (err) { res.status(500).json(err) }

});

module.exports = router;