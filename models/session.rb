require 'mongoid'

class Sessionob
  include Mongoid::Document

  has_and_belongs_to_many :spaces

  has_one :visitorgroup
  field :visitorgroup, :type => Object, :default => nil

  has_many :medias
  field :media_ids, :type => Array, :default => []

  has_many :eventobs
  field :eventob_ids, :type => Array, :default => []

  has_one :storage, class_name: "Storage"
  field :storage, :type => Object, :default => nil

  field :room_id, :type => String
  field :label, :type => String
  field :created_on, :type => Bignum
  field :finished_on, :type => Bignum
  field :stats, :type => Array, :default => []

  # searches for this model will only return if finished_on is not nil
  # also requires that mongoid.yml contains 'options: raise_not_found_error: false' so that default scope searches for unfinished IDs does not result in error
  default_scope where(:finished_on.ne => nil)
end
