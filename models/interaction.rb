require 'mongoid'

class Interaction
  include Mongoid::Document

  belongs_to :eventob

  has_and_belongs_to_many :visitors
  field :visitors, :type => Array, :default => []

  has_and_belongs_to_many :actions, class_name: "Action"
  field :actions, :type => Array, :default => []

  has_and_belongs_to_many :resources, class_name: "Resource"
  field :resources, :type => Array, :default => []

  field :created_on, :type => Bignum
  field :finished_on, :type => Bignum
end
