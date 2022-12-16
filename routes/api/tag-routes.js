const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {

    const tagData = await Tag.findAll({ include: [{ model: Product, through: ProductTag, as: 'tags_products' }] });

    res.status(200).json(tagData)

  } catch (err) { res.status(500).json(err) }

});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {

    const tagData = await Tag.findByPk(req.params.id, { include: [{ model: Product, through: ProductTag, as: 'tags_products' }] });

    if (!tagData) { return res.status(404).json({ message: 'No tag found with this ID!' }) };

    res.status(200).json(tagData)

  } catch (err) { res.status(500).json(err) }

});

router.post('/', async (req, res) => {
  // create a new tag
  try {

    const tagData = await Tag.create(req.body);

    res.status(200).json(tagData)

  } catch (err) { res.status(400).json(err) }

});

router.put('/:id', async (req, res) => {
  try {

    // update a tag by its `id` value
    await Tag.update(req.body, { where: { id: req.params.id } });

    // find all associated tags from ProuctTag
    const tagProds = await ProductTag.findAll({ where: { tag_id: req.params.id } });

    // get list of all current tag_ids
    const tagProdIds = await tagProds.map(({ product_id }) => product_id);

    // create filtered list of new product_ids
    const newTagProds = await req.body.id
      .filter((product_id) => !tagProdIds.includes(product_id))
      .map((product_id) => { return { tag_id: req.params.id, product_id } })

    // figure out which ones to remove
    const tagProdsToRemove = categoryProds
      .filter(({ product_id }) => !req.body.id.includes(product_id))
      .map(({ id }) => id);

    // run both actions
    const updatedTagProds = await Promise.all([
      ProductTag.destroy({ where: { id: tagProdsToRemove } }),
      ProductTag.bulkCreate(newTagProds),
    ]);

    res.status(200).json(updatedTagProds)

  } catch (err) { res.status(400).json(err) }

});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {

    const tagData = await Tag.destroy({ where: { id: req.params.id } });

    if (!tagData) {
      res.status(404).json({ message: 'No tag with this ID!' });
    }

    res.status(200).json(tagData);
    
  } catch (err) { res.status(500).json(err) }

});

module.exports = router;
