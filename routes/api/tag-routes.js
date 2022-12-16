const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// API/TAGS ENDPOINT

// FIND ALL TAGS
router.get('/', async (req, res) => {
  try {

    const tagData = await Tag.findAll({ include: [{ model: Product, through: ProductTag, as: 'tags_products' }] });

    res.status(200).json(tagData)

  } catch (err) { res.status(500).json(err) }

});

// FIND A TAG BY IT'S 'ID'
router.get('/:id', async (req, res) => {
  try {

    const tagData = await Tag.findByPk(req.params.id, { include: [{ model: Product, through: ProductTag, as: 'tags_products' }] });

    if (!tagData) { return res.status(404).json({ message: 'No tag found with this ID!' }) };

    res.status(200).json(tagData)

  } catch (err) { res.status(500).json(err) }

});

// CREATE A NEW TAG
router.post('/', async (req, res) => {

  try {

    const tagData = await Tag.create(req.body);

    res.status(200).json(tagData)

  } catch (err) { res.status(200).json(err) }

});

// UPDATING A TAG
router.put('/:id', async (req, res) => {
  try {

    // UPDATE TAG BY IT'S ID VALUE
    await Tag.update(req.body, { where: { id: req.params.id } });

    // FIND ALL ASSOCIATED TAGS FROM ProuctTag
    const tagProds = await ProductTag.findAll({ where: { tag_id: req.params.id } });

    // GET LIST OF ALL CURRENT TAG_IDs
    const tagProdIds = await tagProds.map(({ product_id }) => product_id);

    // CREATE FILTERED LIST OF NEW PRODUCT_IDs
    const newTagProds = await req.body.id
      .filter((product_id) => !tagProdIds.includes(product_id))
      .map((product_id) => { return { tag_id: req.params.id, product_id } })

    // FIGURE OUT WHICH TO REMOVE
    const tagProdsToRemove = categoryProds
      .filter(({ product_id }) => !req.body.id.includes(product_id))
      .map(({ id }) => id);

    // EXECUTE BOTH ACTIONS
    const updatedTagProds = await Promise.all([
      ProductTag.destroy({ where: { id: tagProdsToRemove } }),
      ProductTag.bulkCreate(newTagProds),
    ]);

    res.status(200).json(updatedTagProds)

  } catch (err) { res.status(200).json(err) }

});
// DELETE TAG BY IT'S ID
router.delete('/:id', async (req, res) => {
  
  try {

    const tagData = await Tag.destroy({ where: { id: req.params.id } });

    if (!tagData) {
      res.status(404).json({ message: 'No tag with this ID!' });
    }

    res.status(200).json(tagData);
    
  } catch (err) { res.status(500).json(err) }

});

module.exports = router;